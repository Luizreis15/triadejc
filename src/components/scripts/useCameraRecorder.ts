import { useState, useRef, useCallback, useEffect } from "react";

export interface CameraDevice {
  deviceId: string;
  label: string;
}

interface UseCameraRecorderOptions {
  onRecordingComplete?: (blob: Blob) => void;
}

export function useCameraRecorder(options: UseCameraRecorderOptions = {}) {
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [isCameraMirrored, setIsCameraMirrored] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied" | "unknown">("unknown");

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number>();

  // Listar câmeras disponíveis
  const listCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter(device => device.kind === "videoinput")
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Câmera ${device.deviceId.slice(0, 5)}`,
        }));
      
      setAvailableCameras(videoDevices);
      
      if (videoDevices.length > 0 && !selectedCamera) {
        // Preferir câmera frontal por padrão
        const frontCamera = videoDevices.find(d => 
          d.label.toLowerCase().includes("front") || 
          d.label.toLowerCase().includes("frontal") ||
          d.label.toLowerCase().includes("facetime")
        );
        setSelectedCamera(frontCamera?.deviceId || videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (err) {
      console.error("Erro ao listar câmeras:", err);
      return [];
    }
  }, [selectedCamera]);

  // Iniciar câmera
  const startCamera = useCallback(async (deviceId?: string) => {
    try {
      setCameraError(null);
      
      // Parar stream anterior se existir
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId || selectedCamera ? { exact: deviceId || selectedCamera } : undefined,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: deviceId ? undefined : "user",
        },
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      mediaStreamRef.current = stream;
      setIsCameraEnabled(true);
      setPermissionStatus("granted");
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Evitar feedback de áudio
        await videoRef.current.play();
      }

      // Atualizar lista de câmeras (agora com labels)
      await listCameras();
      
      return stream;
    } catch (err: any) {
      console.error("Erro ao iniciar câmera:", err);
      
      if (err.name === "NotAllowedError") {
        setCameraError("Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.");
        setPermissionStatus("denied");
      } else if (err.name === "NotFoundError") {
        setCameraError("Nenhuma câmera encontrada no dispositivo.");
      } else if (err.name === "NotReadableError") {
        setCameraError("Câmera está sendo usada por outro aplicativo.");
      } else {
        setCameraError("Erro ao acessar a câmera. Tente novamente.");
      }
      
      setIsCameraEnabled(false);
      return null;
    }
  }, [selectedCamera, listCameras]);

  // Parar câmera
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraEnabled(false);
    setIsRecording(false);
    setRecordingTime(0);
  }, []);

  // Trocar câmera
  const switchCamera = useCallback(async (deviceId: string) => {
    setSelectedCamera(deviceId);
    if (isCameraEnabled) {
      await startCamera(deviceId);
    }
  }, [isCameraEnabled, startCamera]);

  // Iniciar gravação
  const startRecording = useCallback(() => {
    if (!mediaStreamRef.current) {
      console.error("Nenhum stream de mídia disponível");
      return false;
    }

    try {
      recordedChunksRef.current = [];
      
      // Verificar codecs suportados
      const mimeTypes = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
        "video/mp4",
      ];
      
      let selectedMimeType = "";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        setCameraError("Seu navegador não suporta gravação de vídeo.");
        return false;
      }

      const mediaRecorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: selectedMimeType });
        options.onRecordingComplete?.(blob);
        
        // Limpar timer
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
        }
      };

      mediaRecorder.start(1000); // Chunk a cada segundo
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Timer de gravação
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      return true;
    } catch (err) {
      console.error("Erro ao iniciar gravação:", err);
      setCameraError("Erro ao iniciar gravação.");
      return false;
    }
  }, [options]);

  // Parar gravação
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  }, []);

  // Descartar gravação
  const discardRecording = useCallback(() => {
    recordedChunksRef.current = [];
    setRecordingTime(0);
  }, []);

  // Download do vídeo
  const downloadVideo = useCallback((blob: Blob, filename?: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `gravacao-${new Date().toISOString().slice(0, 10)}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Formatar tempo de gravação
  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Verificar suporte do navegador
  const isSupported = useCallback(() => {
    return !!(
      navigator.mediaDevices?.getUserMedia &&
      window.MediaRecorder
    );
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [stopCamera]);

  return {
    // Refs
    videoRef,
    
    // Estado
    isCameraEnabled,
    isRecording,
    recordingTime,
    availableCameras,
    selectedCamera,
    isCameraMirrored,
    cameraError,
    permissionStatus,
    
    // Ações
    startCamera,
    stopCamera,
    switchCamera,
    startRecording,
    stopRecording,
    discardRecording,
    downloadVideo,
    listCameras,
    setIsCameraMirrored,
    
    // Utilitários
    formatTime,
    isSupported,
  };
}
