// *** นำ Web app URL ที่ได้จาก Google Apps Script มาใส่ตรงนี้ ***
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxEM4L65W3JIkLLDuRZ4ZgN0lK8owC4iueXhqSFMDiMhqmnD49Y0bl5fZ611W-box0/exec';

const PRICES = { sku1: 180, sku2: 210 };

function updateQty(sku, change) {
  const input = document.getElementById(`${sku}-qty`);
  let current = parseInt(input.value) || 0;
  current = Math.max(0, current + change);
  input.value = current;
  calculateTotal();
}

function calculateTotal() {
  const q1 = parseInt(document.getElementById('sku1-qty').value) || 0;
  const q2 = parseInt(document.getElementById('sku2-qty').value) || 0;
  const total = (q1 * PRICES.sku1) + (q2 * PRICES.sku2);
  document.getElementById('total-price').innerText = total.toLocaleString();
  return total;
}

document.getElementById('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const q1 = parseInt(document.getElementById('sku1-qty').value) || 0;
  const q2 = parseInt(document.getElementById('sku2-qty').value) || 0;
  const total = calculateTotal();

  if (q1 === 0 && q2 === 0) {
    alert('กรุณาเลือกสินค้าอย่างน้อย 1 แท่งครับ');
    return;
  }

  const btn = document.getElementById('submit-btn');
  const statusDiv = document.getElementById('order-status');
  btn.disabled = true;
  btn.innerText = 'กำลังบันทึกคำสั่งซื้อ...';

  const payload = {
    action: 'create',
    name: document.getElementById('cust-name').value.trim(),
    phone: document.getElementById('cust-phone').value.trim(),
    address: document.getElementById('cust-address').value.trim(),
    sku1: q1,
    sku2: q2,
    total: total
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (result.status === 'success') {
      statusDiv.style.color = '#2e7d32';
      statusDiv.innerHTML = `สั่งซื้อสำเร็จ! รหัสออเดอร์ของคุณคือ <strong>${result.orderId}</strong>`;
      document.getElementById('order-form').reset();
      document.getElementById('sku1-qty').value = 0;
      document.getElementById('sku2-qty').value = 0;
      calculateTotal();
    }
  } catch (error) {
    statusDiv.style.color = '#d32f2f';
    statusDiv.innerText = 'เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง';
  } finally {
    btn.disabled = false;
    btn.innerText = 'ยืนยันการสั่งซื้อ';
  }
});
