// *** นำ Web app URL เดียวกันมาใส่ตรงนี้ ***
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxEM4L65W3JIkLLDuRZ4ZgN0lK8owC4iueXhqSFMDiMhqmnD49Y0bl5fZ611W-box0/exec';

let allOrders = [];
let currentFilter = 'ALL';

async function fetchOrders() {
  const container = document.getElementById('orders-container');
  container.innerHTML = '<p>กำลังดึงข้อมูลจาก Google Sheets...</p>';

  try {
    const res = await fetch(SCRIPT_URL);
    const json = await res.json();
    if (json.status === 'success') {
      allOrders = json.data.reverse(); // แสดงออเดอร์ล่าสุดขึ้นก่อน
      renderOrders();
    }
  } catch (err) {
    container.innerHTML = '<p style="color:red;">ไม่สามารถดึงข้อมูลได้ ตรวจสอบ URL หรือการตั้งค่าสิทธิ์</p>';
  }
}

function filterOrders(status) {
  currentFilter = status;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderOrders();
}

function renderOrders() {
  const container = document.getElementById('orders-container');
  const filtered = currentFilter === 'ALL' 
    ? allOrders 
    : allOrders.filter(o => o.Status === currentFilter);

  if (filtered.length === 0) {
    container.innerHTML = '<p>ไม่มีรายการคำสั่งซื้อในหมวดหมู่นี้</p>';
    return;
  }

  container.innerHTML = filtered.map(order => `
    <div class="order-card ${order.Status === 'Packed' ? 'packed' : ''}">
      <div style="display:flex; justify-content:space-between;">
        <strong>${order.Order_ID}</strong>
        <span>${order.Status === 'Packed' ? '✅ แพ็คแล้ว' : '⏳ รอแพ็ค'}</span>
      </div>
      <small>${order.Timestamp}</small>
      <hr>
      <p><strong>ลูกค้า:</strong> ${order.Customer_Name} (${order.Phone})</p>
      <p><strong>ที่อยู่:</strong> ${order.Address}</p>
      
      <div class="pick-list">
        <strong>รายการหยิบสินค้า (Pick List):</strong>
        <ul style="margin:5px 0; padding-left:20px;">
          ${order.SKU_Dark70_Qty > 0 ? `<li><strong>[CHOC-DK70]</strong> 70% Dark Bar: <strong>${order.SKU_Dark70_Qty} แท่ง</strong></li>` : ''}
          ${order.SKU_Hazelnut_Qty > 0 ? `<li><strong>[CHOC-HZ02]</strong> Hazelnut Milk Bar: <strong>${order.SKU_Hazelnut_Qty} แท่ง</strong></li>` : ''}
        </ul>
        <div>ยอดรวม: ${order.Total_Price} บาท</div>
      </div>

      <div class="card-actions">
        <button class="btn-print" onclick="printLabel('${order.Order_ID}')">🖨️ พิมพ์ใบจ่าหน้า</button>
        ${order.Status !== 'Packed' ? `<button class="btn-pack" onclick="markAsPacked('${order.Order_ID}')">📦 ยืนยันแพ็คเสร็จ</button>` : ''}
      </div>
    </div>
  `).join('');
}

function printLabel(orderId) {
  const order = allOrders.find(o => o.Order_ID === orderId);
  if (!order) return;

  const printArea = document.getElementById('print-area');
  printArea.innerHTML = `
    <div class="shipping-label">
      <div class="label-header">
        <strong>VELVET CACAO</strong>
        <span>Order: ${order.Order_ID}</span>
      </div>
      <div class="label-section">
        <strong>ผู้ส่ง:</strong> ร้าน VELVET CACAO (โทร. 099-999-9999)<br>
        กรุงเทพมหานคร 10110
      </div>
      <div class="label-section" style="border: 1px solid #000; padding: 10px;">
        <strong>ผู้รับ (TO):</strong><br>
        <span style="font-size: 16px; font-weight: bold;">${order.Customer_Name}</span><br>
        โทร: ${order.Phone}<br>
        ${order.Address}
      </div>
      <div class="label-items">
        <strong>รายการสินค้าในกล่อง (Packing Slip):</strong><br>
        ${order.SKU_Dark70_Qty > 0 ? `- 70% Dark Chocolate Bar (CHOC-DK70) x ${order.SKU_Dark70_Qty}<br>` : ''}
        ${order.SKU_Hazelnut_Qty > 0 ? `- Roasted Hazelnut Milk Bar (CHOC-HZ02) x ${order.SKU_Hazelnut_Qty}<br>` : ''}
      </div>
    </div>
  `;

  window.print();
}

async function markAsPacked(orderId) {
  if (!confirm(`ยืนยันว่าหยิบและแพ็คสินค้าออเดอร์ ${orderId} เรียบร้อยแล้ว?`)) return;

  try {
    await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'updateStatus',
        orderId: orderId,
        newStatus: 'Packed'
      })
    });
    fetchOrders(); // โหลดสถานะใหม่
  } catch (err) {
    alert('อัปเดตสถานะไม่สำเร็จ');
  }
}

// โหลดข้อมูลทันทีเมื่อเปิดหน้าเว็บ
fetchOrders();
