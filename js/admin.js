const formCard = document.getElementById("formCard");
const btnMoForm = document.getElementById("btnMoForm");
const petForm = document.getElementById("petForm");
const formTitle = document.getElementById("formTitle");
const cancelButton = document.getElementById("cancelButton");
const tableBody = document.getElementById("petTableBody");
let editingPetId = null;

const fetchPets = async () => {
    try {
        const pets = await petAPI.layDanhSach();
        renderPetsToTable(pets);
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Không thể tải dữ liệu. Vui lòng thử lại.</td></tr>`;
        alert("Có lỗi xảy ra khi tải danh sách thú cưng!");
    }
};

const renderPetsToTable = (pets) => {
    if (!pets || pets.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">Chưa có thú cưng nào.</td></tr>`;
        return;
    }

    const htmlContent = pets.map((pet) => {
        return `
            <tr>
                <td>${pet.petId}</td>
                <td><img src="${pet.hinhAnh}" alt="${pet.ten}" class="img-thumb"></td>
                <td>${pet.ten}</td>
                <td>${pet.loai}</td>
                <td>${pet.tuoi}</td>
                <td>${pet.gioiTinh}</td>
                <td>
                    <button class="btn-icon btn-edit" type="button" onclick="editPet('${pet.petId}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" type="button" onclick="deletePet('${pet.petId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    tableBody.innerHTML = htmlContent;
};

const showForm = (visible) => {
    formCard.classList.toggle("hidden", !visible);
};

const resetForm = () => {
    editingPetId = null;
    petForm.reset();
    formTitle.textContent = "Thêm thú cưng mới";
};

const editPet = async (petId) => {
    try {
        const pet = await petAPI.layMotPhan(petId);
        document.getElementById("petName").value = pet.ten || "";
        document.getElementById("petBreed").value = pet.loai || "";
        document.getElementById("petAge").value = pet.tuoi || "";
        document.getElementById("petGender").value = pet.gioiTinh || "female";
        document.getElementById("petImage").value = pet.hinhAnh || "";
        editingPetId = petId;
        formTitle.textContent = "Chỉnh sửa thông tin thú cưng";
        showForm(true);
    } catch (error) {
        console.error(error);
        alert("Không thể tải thông tin thú cưng.");
    }
};

const deletePet = async (petId) => {
    const confirmDelete = confirm("Bạn có chắc muốn xóa thú cưng này?");
    if (!confirmDelete) return;

    try {
        await petAPI.xoa(petId);
        await fetchPets();
    } catch (error) {
        console.error(error);
        alert("Xóa thú cưng thất bại.");
    }
};

const savePet = async (event) => {
    event.preventDefault();
    const petData = {
        ten: document.getElementById("petName").value.trim(),
        loai: document.getElementById("petBreed").value.trim(),
        tuoi: Number(document.getElementById("petAge").value),
        gioiTinh: document.getElementById("petGender").value,
        hinhAnh: document.getElementById("petImage").value.trim(),
    };

    if (!petData.ten || !petData.loai || !petData.tuoi || !petData.hinhAnh) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    try {
        if (editingPetId) {
            await petAPI.capNhat(editingPetId, petData);
        } else {
            await petAPI.themMoi(petData);
        }
        resetForm();
        showForm(false);
        await fetchPets();
    } catch (error) {
        console.error(error);
        alert("Lưu dữ liệu thất bại. Vui lòng thử lại.");
    }
};

btnMoForm.addEventListener("click", () => {
    resetForm();
    showForm(true);
});

cancelButton.addEventListener("click", () => {
    resetForm();
    showForm(false);
});

petForm.addEventListener("submit", savePet);

window.editPet = editPet;
window.deletePet = deletePet;

fetchPets();