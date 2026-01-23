import SalesPage from "./SalesPage";

const CHECKOUT_URL_JUNICA = "https://pay.kiwify.com.br/Kp2712c";

export default function SalesPageJunica() {
  return (
    <SalesPage 
      price={47}
      originalPrice={97}
      checkoutUrl={CHECKOUT_URL_JUNICA}
    />
  );
}
