// utils/shipping.ts
export const getShippingCost = (totalPrice: number): number => {
  if (totalPrice < 50000) return 10000;
  if (totalPrice < 100000) return 5000;
  return 0;
};

// utils/getShippingMessage.ts
export const getShippingMessage = (totalPrice: number): string => {
  // Función interna para formatear precios
  const formatPrice = (value: number) =>
    value.toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });

  if (totalPrice < 50000) {
    const diff = 50000 - totalPrice;
    return `¡Estás cerca! Solo ${formatPrice(
      diff
    )} más y tu pedido tendrá envío por solo 5.000 COP.`;
  }

  if (totalPrice < 100000) {
    const diff = 100000 - totalPrice;
    return `¡Casi llegas! Agrega ${formatPrice(
      diff
    )} más para disfrutar de envío gratis en tu pedido.`;
  }

  return "";
};
