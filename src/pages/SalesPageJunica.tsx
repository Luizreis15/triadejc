import SalesPage from "./SalesPage";

// TODO: Substituir pela URL real do Kiwify quando criar o produto de R$ 47
const CHECKOUT_URL_JUNICA = "https://pay.kiwify.com.br/SEU_LINK_47";

export default function SalesPageJunica() {
  return (
    <SalesPage 
      price={47}
      originalPrice={97}
      checkoutUrl={CHECKOUT_URL_JUNICA}
    />
  );
}
