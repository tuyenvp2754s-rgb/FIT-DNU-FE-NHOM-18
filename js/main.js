const API_URL = "https://69f9a69fc509a40d3aa2ee21.mockapi.io/api/v1/pets";
const petDisplayGrid = document.getElementById("petDisplayGrid");
const loader = document.getElementById("loader");
const cartCount = document.getElementById("cartCount");
const totalPets = document.getElementById("totalPets");
let adoptCount = 0;

const fetchPets = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error("Không thể lấy dữ liệu từ API");
        }
        const pets = await response.json();
        renderPetGrid(pets);
    } catch (error) {
        console.error(error);
        loader.textContent = "Không thể tải dữ liệu. Vui lòng thử lại.";
    }
};

const renderPetGrid = (pets) => {
    loader.style.display = "none";
    totalPets.textContent = `${pets.length} bé`;

    if (!pets || pets.length === 0) {
        petDisplayGrid.innerHTML = `<div class="empty-state">Chưa có thú cưng nào để hiển thị.</div>`;
        return;
    }

    petDisplayGrid.innerHTML = pets
        .map((pet) => {
            return `
                <article class="pet-card">
                    <img src="${pet.hinhAnh}" alt="${pet.ten}">
                    <div class="pet-card-body">
                        <h3>${pet.ten}</h3>
                        <p>${pet.loai} • ${pet.tuoi} tuổi • ${pet.gioiTinh}</p>
                        <button class="btn-primary" type="button" onclick="handleAdopt('${pet.ten}')">Nhận nuôi</button>
                    </div>
                </article>
            `;
        })
        .join("");
};

const handleAdopt = (petName) => {
    adoptCount += 1;
    cartCount.textContent = adoptCount;
    alert(`Bạn đã chọn nhận nuôi ${petName}. Cảm ơn bạn!`);
};

window.handleAdopt = handleAdopt;
fetchPets();
