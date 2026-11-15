export function paymentQrUrl(bank, amount, reference) {
  if (!bank || amount <= 0) return null;
  if (bank.qrType === "custom_image" && bank.customQrImage)
    return bank.customQrImage;
  if (!bank.accountNumber || !bank.bankBin || !reference) return null;

  const url = new URL("https://vietqr.app/img");
  url.search = new URLSearchParams({
    acc: bank.accountNumber,
    bank: bank.bankBin,
    amount: String(amount),
    des: reference,
    template: "compact",
  }).toString();
  return url.href;
}
