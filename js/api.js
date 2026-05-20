class APIResource {
  constructor(apiBaseURL, resourceName) {
    this.resourceName = resourceName;
    this.baseUrl = `${apiBaseURL}/${resourceName}`;
  }

  async layDanhSach() {
    const response = await fetch(this.baseUrl);
    if (!response.ok) {
      throw new Error(`Không thể lấy danh sách ${this.resourceName}`);
    }
    return await response.json();
  }

  async layMotPhan(id) {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Không thể lấy ${this.resourceName} có id = ${id}`);
    }
    return await response.json();
  }

  async themMoi(dinhNghia) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dinhNghia),
    });
    if (!response.ok) {
      throw new Error(`Không thể thêm ${this.resourceName}`);
    }
    return await response.json();
  }

  async capNhat(id, thongTinMoi) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(thongTinMoi),
    });
    if (!response.ok) {
      throw new Error(`Không thể cập nhật ${this.resourceName} có id = ${id}`);
    }
    return await response.json();
  }

  async xoa(id) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Không thể xóa ${this.resourceName} có id = ${id}`);
    }
    return await response.json();
  }
}

const API_URL = "https://69f9a69fc509a40d3aa2ee21.mockapi.io/api/v1";
const petAPI = new APIResource(API_URL, "pets");
window.petAPI = petAPI;