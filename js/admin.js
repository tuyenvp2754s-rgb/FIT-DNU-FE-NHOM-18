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
        tableBody.innerHTML = `<tr><td colspan="8" class="empty-state">Chưa có thú cưng nào.</td></tr>`;
        return;
    }

    const htmlContent = pets.map((pet) => {
        return `
            <tr>
                <td>${pet.id}</td>
                <td><img src="${pet.image}" alt="${pet.name}" class="img-thumb"></td>
                <td>${pet.name}</td>
                <td>${pet.category}</td>
                <td>${pet.age}</td>
                <td>${pet.gender}</td>
                <td>${pet.price}</td>
                <td>
                    <button class="btn-icon btn-edit" type="button" onclick="editPet('${pet.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" type="button" onclick="deletePet('${pet.id}')">
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
        document.getElementById("petName").value = pet.name || "";
        document.getElementById("petBreed").value = pet.category || "";
        document.getElementById("petAge").value = pet.age || "";
        document.getElementById("petGender").value = pet.gender || "female";
        document.getElementById("petImage").value = pet.image || "";
        document.getElementById("petPrice").value = pet.price || "";
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
        name: document.getElementById("petName").value.trim(),
        category: document.getElementById("petBreed").value.trim(),
        age: Number(document.getElementById("petAge").value),
        gender: document.getElementById("petGender").value,
        image: document.getElementById("petImage").value.trim(),
        price: Number(document.getElementById("petPrice").value),
    };

    if (!petData.name || !petData.category || !petData.age || !petData.image) {
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