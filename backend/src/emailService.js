const nodemailer = require('nodemailer');

// Initialize Transporter using Gmail SMTP with App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'giautenbantoan@gmail.com',
    pass: (process.env.EMAIL_PASS || '').replace(/\s+/g, ''), // Ensure no whitespaces in app password
  },
});

/**
 * Send booking or costume rental confirmation email to customer
 * @param {Object} order - Order record from PostgreSQL
 */
const sendOrderConfirmationEmail = async (order) => {
  if (!order || !order.email) {
    console.log('⚠️ Không có địa chỉ email khách hàng để gửi thông báo.');
    return { success: false, message: 'No customer email provided' };
  }

  const customerName = order.customerName || order.customer_name || 'Quý khách';
  const orderId = order.id || 'AUR-ORDER';
  const serviceType = order.serviceType || order.service_type || 'Dịch Vụ Studio';
  const itemDetails = order.itemDetails || order.item_details || 'Dịch vụ tại Aura Studio';
  const bookingDate = order.bookingDate || order.booking_date || 'Liên hệ studio';
  const returnDate = order.returnDate || order.return_date || '';
  const rentalDays = order.rentalDays || order.rental_days || 1;
  const timeSlot = order.timeSlot || order.time_slot || '';
  const totalAmount = Number(order.totalAmount || order.total_amount || 0);
  const depositAmount = Number(order.depositAmount || order.deposit_amount || 0);
  const remainingAmount = Math.max(0, totalAmount - depositAmount);
  const notes = order.notes || '';

  const isRental = serviceType.includes('Thuê Trang Phục') || serviceType.includes('Cho Thuê');

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác Nhận Đặt Dịch Vụ - Aura Studio</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0f172a; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);">
          
          <!-- Header Banner with Gold Accents -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 36px 32px; text-align: center; border-bottom: 3px solid #d97706;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center">
                    <div style="display: inline-block; padding: 6px 16px; background-color: rgba(217, 119, 6, 0.15); border: 1px solid rgba(217, 119, 6, 0.4); border-radius: 9999px; margin-bottom: 12px;">
                      <span style="color: #fbbf24; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">AURA STUDIO & COSTUMES</span>
                    </div>
                    <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">XÁC NHẬN ĐẶT DỊCH VỤ THÀNH CÔNG</h1>
                    <p style="margin: 0; color: #94a3b8; font-size: 13px;">Cảm ơn quý khách đã tin tưởng và đồng hành cùng Aura Studio</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Welcome & Order Code Badge -->
          <tr>
            <td style="padding: 32px 32px 16px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #1e293b;">
                Kính gửi <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Aura Studio xin trân trọng thông báo yêu cầu đặt lịch / thuê đồ của quý khách đã được tiếp nhận và <strong>ghi nhận thanh toán cọc thành công</strong> trên hệ thống. Dưới đây là thông tin chi tiết đơn hàng:
              </p>

              <!-- Order ID Highlight Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fef3c7; border: 1px dashed #d97706; border-radius: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px; text-align: center;">
                    <span style="display: block; font-size: 11px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 1px;">Mã Tra Cứu Đơn Hàng</span>
                    <strong style="font-size: 22px; font-family: monospace, Courier, monospace; color: #b45309; letter-spacing: 1px;">${orderId}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Details Table -->
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td colspan="2" style="padding: 14px 20px; background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                    <strong style="font-size: 13px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Chi Tiết Dịch Vụ Đã Đặt</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b; width: 40%; border-bottom: 1px solid #f1f5f9;">Loại Dịch Vụ:</td>
                  <td style="padding: 12px 20px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${serviceType}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Chi Tiết / Sản Phẩm:</td>
                  <td style="padding: 12px 20px; font-size: 13px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${itemDetails}</td>
                </tr>
                ${isRental ? `
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Thời Gian Thuê:</td>
                  <td style="padding: 12px 20px; font-size: 13px; font-weight: 600; color: #b45309; border-bottom: 1px solid #f1f5f9;">${rentalDays} Ngày (Nhận: ${bookingDate})</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Hạn Trả Đồ Tự Động:</td>
                  <td style="padding: 12px 20px; font-size: 13px; font-weight: 700; color: #dc2626; border-bottom: 1px solid #f1f5f9;">${returnDate || 'Theo quy định 7 ngày'}</td>
                </tr>
                ` : `
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9;">Ngày & Ca Giờ Chụp:</td>
                  <td style="padding: 12px 20px; font-size: 13px; font-weight: 700; color: #b45309; border-bottom: 1px solid #f1f5f9;">${bookingDate} ${timeSlot ? `(${timeSlot})` : ''}</td>
                </tr>
                `}
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #64748b;">Trạng Thái Đơn:</td>
                  <td style="padding: 12px 20px; font-size: 13px; font-weight: 700; color: #059669;">Đã Đặt Cọc - Sẵn Sàng Phục Vụ</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Financial Breakdown Box -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #475569; border-bottom: 1px solid #e2e8f0;">Tổng giá trị dịch vụ:</td>
                  <td style="padding: 12px 20px; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right; border-bottom: 1px solid #e2e8f0;">${totalAmount.toLocaleString('vi-VN')} VNĐ</td>
                </tr>
                <tr>
                  <td style="padding: 12px 20px; font-size: 13px; color: #059669; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Số tiền đã đặt cọc:</td>
                  <td style="padding: 12px 20px; font-size: 14px; font-weight: 800; color: #059669; text-align: right; border-bottom: 1px solid #e2e8f0;">- ${depositAmount.toLocaleString('vi-VN')} VNĐ</td>
                </tr>
                <tr style="background-color: #f1f5f9;">
                  <td style="padding: 14px 20px; font-size: 14px; font-weight: 800; color: #0f172a;">Số tiền còn lại khi nhận đồ / chụp:</td>
                  <td style="padding: 14px 20px; font-size: 16px; font-weight: 800; color: #b45309; text-align: right;">${remainingAmount.toLocaleString('vi-VN')} VNĐ</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Studio Information & Guidelines -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px 20px; border-radius: 0 12px 12px 0; margin-bottom: 24px;">
                <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #1e3a8a; font-weight: 700;">LƯU Ý DÀNH CHO QUÝ KHÁCH:</h4>
                <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #1e40af; line-height: 1.6;">
                  <li>Vui lòng lưu lại mã đơn hàng <strong>${orderId}</strong> hoặc mang theo email này khi đến nhận trang phục / chụp ảnh.</li>
                  <li>Nếu có nhu cầu đổi lịch hẹn hoặc gia hạn ngày thuê, vui lòng liên hệ hotline trước ít nhất 12 giờ.</li>
                  <li>Tiền đặt cọc trang phục sẽ được hoàn trả 100% ngay khi quý khách hoàn tất trả trang phục nguyên vẹn theo đúng quy định.</li>
                </ul>
              </div>

              <!-- Contact Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <tr>
                  <td style="font-size: 12px; color: #64748b; line-height: 1.6;">
                    <strong style="color: #0f172a; font-size: 13px; display: block; margin-bottom: 4px;">AURA STUDIO & COSTUME RENTAL</strong>
                    📍 <strong>Địa chỉ:</strong> 101 Hoàng Cầu, Phường Ô Chợ Dừa, Quận Đống Đa, TP. Hà Nội<br>
                    📞 <strong>Hotline / Zalo:</strong> <a href="tel:0975397923" style="color: #b45309; font-weight: 700; text-decoration: none;">0975.397.923</a><br>
                    🌐 <strong>Website:</strong> <a href="http://localhost" style="color: #b45309; text-decoration: none;">aurastudio.vn</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                Email này được gửi tự động từ hệ thống quản lý Aura Studio. Quý khách vui lòng không phản hồi trực tiếp qua email này.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"Aura Studio & Costumes" <${process.env.EMAIL_USER || 'giautenbantoan@gmail.com'}>`,
    to: order.email,
    subject: `[Aura Studio] Xác Nhận Đặt Dịch Vụ Thành Công - Mã Đơn: ${orderId}`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Email Service] Đã gửi email xác nhận thành công tới ${order.email} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [Email Service] Lỗi khi gửi email xác nhận tới ${order.email}:`, error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
};
