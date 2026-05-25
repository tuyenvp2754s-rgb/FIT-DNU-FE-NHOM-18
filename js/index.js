const API_BASE_URL = "https://6a0d322e769682b8ee75c462.mockapi.io/api/v1";
const API_URL = `${API_BASE_URL}/pets`;
const ADOPTIONS_URL = `${API_BASE_URL}/adoptions`;
let allPets = [];
let likedPets = JSON.parse(localStorage.getItem("liked")) || [];

const safeString = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") return "";
  return String(val).trim();
};

const normalizeStatusToUI = (status) => {
  const normalized = safeString(status).toLowerCase();
  if (!normalized) return "Còn";
  if (normalized === "available" || normalized === "con") return "Còn";
  if (
    normalized === "pending" ||
    normalized === "đang chờ" ||
    normalized === "dang cho"
  ) {
    return "Đang chờ";
  }
  if (
    normalized === "sold" ||
    normalized === "đã được nhận" ||
    normalized === "da duoc nhan"
  ) {
    return "Đã được nhận";
  }
  return safeString(status);
};

const normalizeGender = (value) => {
  const normalized = safeString(value).toLowerCase();
  if (
    normalized === "female" ||
    normalized === "cái" ||
    normalized === "cai" ||
    normalized === "nữ"
  ) {
    return "female";
  }
  if (
    normalized === "male" ||
    normalized === "đực" ||
    normalized === "duc" ||
    normalized === "nam"
  ) {
    return "male";
  }
  return "";
};

const normalizeAge = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const mapPetToUI = (pet) => {
  const age = normalizeAge(pet.age);
  return {
    id: String(pet.id),
    name: safeString(pet.name),
    category: safeString(pet.category),
    image: safeString(pet.image),
    age: age > 0 ? `${age} tháng` : "",
    ageNum: age,
    gender: normalizeGender(pet.gender),
    price: Number(pet.price || 0),
    status: normalizeStatusToUI(pet.status),
    description: safeString(pet.description),
    raw: pet || {},
  };
};

async function fetchPets() {
  const apiStatus = document.getElementById("api-status");
  const skeleton = document.getElementById("skeleton-container");
  const container = document.getElementById("pet-container");

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error();
    const rawPets = await response.json();

    allPets = rawPets
      .filter((pet) => pet && pet.id)
      .slice(0, 100)
      .map(mapPetToUI);

    apiStatus.className =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 pulse-glow";
    apiStatus.innerHTML =
      '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Trực tuyến';

    filterAndSort();

    skeleton.classList.add("hidden");
    container.classList.remove("hidden");
  } catch (error) {
    apiStatus.className =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100";
    apiStatus.innerHTML =
      '<span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Ngoại tuyến';
    showToast("Mất kết nối", "Vui lòng kiểm tra lại đường truyền API.", "❌");
  }
}

function filterAndSort() {
  const container = document.getElementById("pet-container");
  container.innerHTML = "";

  const query = document.getElementById("search-input").value.toLowerCase();
  const genderFilter = document.getElementById("gender-filter").value;
  const sortFilter = document.getElementById("sort-filter").value;

  let filtered = allPets.filter((pet) => {
    const name = pet.name ? pet.name.toLowerCase() : "";
    const category = pet.category ? pet.category.toLowerCase() : "";
    const matchesSearch = name.includes(query) || category.includes(query);
    const matchesGender =
      genderFilter === "all" ||
      (pet.gender && pet.gender.toLowerCase() === genderFilter);
    return matchesSearch && matchesGender;
  });

  if (sortFilter === "price-asc") {
    filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortFilter === "price-desc") {
    filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortFilter === "age-asc") {
    filtered.sort((a, b) => (a.ageNum || 0) - (b.ageNum || 0));
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <span class="text-5xl">🔍</span>
        <h3 class="text-lg font-bold text-slate-700 mt-4">Không tìm thấy thú cưng</h3>
      </div>`;
    return;
  }

  filtered.forEach((pet) => {
    const isLiked = likedPets.includes(pet.id);
    const heartClass = isLiked
      ? "fa-solid text-pink-500 scale-110"
      : "fa-regular text-slate-600";

    let badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
    if (pet.status === "Đang chờ")
      badgeColor = "bg-amber-50 text-amber-700 border border-amber-100";
    if (pet.status === "Đã được nhận")
      badgeColor = "bg-slate-100 text-slate-500 border border-slate-200";

    const isDisable =
      pet.status !== "Còn"
        ? "pointer-events-none bg-slate-200 text-slate-400"
        : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/15 text-white";

    const petImageMarkup = pet.image
      ? `<img src="${pet.image}" alt="${pet.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700">`
      : `<div class="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400"><i class="fa-solid fa-paw text-3xl"></i></div>`;

    container.innerHTML += `
      <div class="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-indigo-600/10 border border-slate-100/80 transition-all duration-500 flex flex-col group transform hover:-translate-y-3">
        <div class="relative overflow-hidden aspect-[4/3] bg-slate-100">
          ${petImageMarkup}
          <div class="absolute top-4 left-4 flex gap-2">
            <span class="px-3.5 py-1.5 rounded-full text-xs font-bold ${badgeColor} shadow-md backdrop-blur-md">
              ${pet.status}
            </span>
          </div>

          <button onclick="toggleLike('${pet.id}', event)" class="absolute top-4 right-4 bg-white/80 hover:bg-white text-slate-800 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-md">
            <i class="${heartClass} fa-heart"></i>
          </button>

          <div class="absolute bottom-4 right-4 bg-slate-900/85 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl backdrop-blur-sm">
            Phí: $${pet.price || 0}
          </div>
        </div>
        <div class="p-6 flex flex-col flex-grow">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${pet.gender === "female" ? "bg-pink-50 text-pink-600" : "bg-blue-50 text-blue-600"}">
              ${pet.gender === "female" ? "♀ Cái" : "♂ Đực"}
            </span>
            <span class="text-slate-400 text-xs font-semibold">${pet.age}</span>
          </div>
          <h3 class="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors duration-300">${pet.name}</h3>
          <p class="text-slate-500 text-sm font-semibold mt-1 mb-4">${pet.category}</p>

          <button onclick='openModal(${JSON.stringify(pet)})' class="w-full mt-auto py-3.5 rounded-2xl font-bold shadow-md active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 ${isDisable}">
            ${pet.status === "Còn" ? '<i class="fa-solid fa-heart-crack"></i> Đăng Ký Nhận Nuôi' : "Tạm khóa"}
          </button>
        </div>
      </div>`;
  });
}

function toggleLike(id, event) {
  event.stopPropagation();
  if (likedPets.includes(id)) {
    likedPets = likedPets.filter((item) => item !== id);
    showToast("Đã bỏ yêu thích", "Cập nhật thành công!", "💔");
  } else {
    likedPets.push(id);
    showToast("Đã yêu thích", "Cơ hội tìm mái ấm cho bé tăng cao!", "💖");
  }
  localStorage.setItem("liked", JSON.stringify(likedPets));
  filterAndSort();
}

function openModal(pet) {
  const modal = document.getElementById("adopt-modal");
  const inner = modal.querySelector("div");

  document.getElementById("modal-pet-id").value = pet.id;
  document.getElementById("modal-pet-name").innerText = pet.name;
  document.getElementById("modal-pet-info").innerText =
    `${pet.gender === "female" ? "♀ Bé Cái" : "♂ Bé Đực"} • ${pet.category} • ${pet.age}`;
  document.getElementById("modal-pet-desc").innerText = pet.description;
  document.getElementById("modal-pet-img").src = pet.image;

  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    inner.classList.remove("scale-95");
  }, 10);
}

function closeModal() {
  const modal = document.getElementById("adopt-modal");
  const inner = modal.querySelector("div");
  modal.classList.add("opacity-0");
  inner.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
  document.getElementById("adopt-form").reset();
}

async function submitForm(event) {
  event.preventDefault();
  const petId = document.getElementById("modal-pet-id").value;
  const userName = document.getElementById("user-name").value;
  const userPhone = document.getElementById("user-phone").value;
  const submitBtn = document.getElementById("submit-btn");

  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<i class="fa-solid fa-circle-notch animate-spin"></i> Đang kết nối server...';

  try {
    const targetLocalPet = allPets.find((pet) => pet.id === petId);
    if (!targetLocalPet) throw new Error("Không tìm thấy thú cưng.");

    const petPayload = {
      ...(targetLocalPet.raw || {}),
      id: targetLocalPet.id,
      name: targetLocalPet.name,
      category: targetLocalPet.category,
      image: targetLocalPet.image,
      age: targetLocalPet.ageNum,
      gender: targetLocalPet.gender,
      price: targetLocalPet.price,
      description: targetLocalPet.description,
      status: "Pending",
    };

    const petResponse = await fetch(`${API_URL}/${petId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(petPayload),
    });

    if (!petResponse.ok) throw new Error();

    const adoptionPayload = {
      petId: targetLocalPet.id,
      petName: targetLocalPet.name,
      petImage: targetLocalPet.image,
      petCategory: targetLocalPet.category,
      petAge: targetLocalPet.ageNum,
      petGender: targetLocalPet.gender,
      petPrice: targetLocalPet.price,
      userName,
      userPhone,
      status: "Chờ duyệt",
      createdAt: new Date().toISOString(),
    };

    const adoptionResponse = await fetch(ADOPTIONS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adoptionPayload),
    });

    if (!adoptionResponse.ok) throw new Error();

    closeModal();
    showToast(
      "Gửi hồ sơ thành công!",
      `Yêu cầu nuôi bé ${targetLocalPet.ten} đã lưu vào API.`,
      "🎉",
    );
    await fetchPets();
  } catch (error) {
    showToast("Thất bại", "Gặp sự cố kết nối server MockAPI.", "❌");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML =
      '<i class="fa-solid fa-heart-circle-check"></i> Đăng Ký Nhận Nuôi';
  }
}

function showToast(title, msg, icon = "✨") {
  const toast = document.getElementById("toast");
  document.getElementById("toast-icon").innerText = icon;
  document.getElementById("toast-title").innerText = title;
  document.getElementById("toast-msg").innerText = msg;
  toast.classList.remove("translate-y-20", "opacity-0");
  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
  }, 4000);
}

window.filterAndSort = filterAndSort;
window.toggleLike = toggleLike;
window.openModal = openModal;
window.closeModal = closeModal;
window.submitForm = submitForm;
window.showToast = showToast;

window.addEventListener("DOMContentLoaded", fetchPets);
