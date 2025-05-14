// --- State ---
const apiUrl = '/api/users';
let token = '';
let isAdmin = false;
let currentUser = '';

// --- DOM Elements ---
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const userSection = document.getElementById('user-section');
const adminSection = document.getElementById('admin-section');
const userTableBody = document.getElementById('userTableBody');
const messageDiv = document.getElementById('message');
const currentUserSpan = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const userBar = document.getElementById('user-bar');
const adSection = document.getElementById('ad-section');
const adForm = document.getElementById('adForm');
const adsList = document.getElementById('adsList');
const adsTable = document.getElementById('adsTable');
const adsActionsHeader = document.getElementById('adsActionsHeader');
const modalOverlay = document.getElementById('modalOverlay');
const modalBox = document.getElementById('modalBox');
const adSearchInput = document.getElementById('adSearchInput');
const adMinPrice = document.getElementById('adMinPrice');
const adMaxPrice = document.getElementById('adMaxPrice');
let allAds = [];
const userSearchInput = document.getElementById('userSearchInput');
let allUsers = [];
// --- Utility ---
function showMessage(msg, isError = false, targetDiv = messageDiv) {
  targetDiv.textContent = msg;
  targetDiv.classList.toggle('error', isError);
  targetDiv.style.color = isError ? '#b71c1c' : '#388e3c';
  // Only show the bar if there is a message
  if (msg) {
    targetDiv.classList.add('active');
  } else {
    targetDiv.classList.remove('active');
  }
  // Only show for non-empty message
  if (msg) {
    targetDiv.style.display = 'block';
  } else {
    targetDiv.style.display = 'none';
  }
  setTimeout(() => {
    targetDiv.textContent = '';
    targetDiv.classList.remove('error');
    targetDiv.classList.remove('active');
    targetDiv.style.display = 'none';
  }, 2500);
}
function fetchUsers() {
  fetch(apiUrl, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(async res => {
      if (!res.ok) {
        // Try to get error message from backend
        let errMsg = 'Failed to fetch users';
        try {
          const data = await res.json();
          errMsg = data.message || data.error || errMsg;
        } catch {}
        showMessage(errMsg, true);
        allUsers = [];
        renderUsers([]);
        return;
      }
      return res.json();
    })
    .then(users => {
      if (users && Array.isArray(users)) {
        allUsers = users;
        filterAndRenderUsers();
      }
    })
    .catch(() => {
      showMessage('Failed to fetch users', true);
      allUsers = [];
      renderUsers([]);
    });
}
function showModal(contentBuilder, onConfirm, onCancel) {
  // contentBuilder is a function that receives the modalBox and fills it with elements
  modalBox.innerHTML = '';
  contentBuilder(modalBox);
  modalOverlay.classList.add('active');
  const confirmBtn = modalBox.querySelector('.modal-confirm');
  const cancelBtn = modalBox.querySelector('.modal-cancel');
  if (confirmBtn) confirmBtn.onclick = () => { onConfirm && onConfirm(); };
  if (cancelBtn) cancelBtn.onclick = () => { closeModal(); onCancel && onCancel(); };
}

function closeModal() { modalOverlay.classList.remove('active'); }
// --- Auth ---
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const regMsgDiv = document.getElementById('register-message');
  try {
    const res = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    let data = {};
    try {
      data = await res.json();
    } catch (err) {
      showMessage('Registration failed (invalid server response)', true, regMsgDiv);
      return;
    }
    if (res.ok && data.token) {
      showMessage('User was created! You can now log in.', false, regMsgDiv);
      registerForm.reset();
    } else {
      showMessage(data.message || 'Registration failed', true, regMsgDiv);
    }
  } catch (err) {
    showMessage('Registration failed', true, regMsgDiv);
  }
});

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const loginMsgDiv = document.getElementById('login-message');
  fetch(`${apiUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
    .then(async res => {
      let data = {};
      try {
        data = await res.json();
      } catch (err) {}
      if (res.ok && data.token) {
        token = data.token;
        currentUser = data.name;
        isAdmin = data.isAdmin;
        showUserSection();
        showMessage('Login successful!');
      } else {
        showMessage(data.message || 'Login failed', true, loginMsgDiv);
      }
    })
    .catch(() => showMessage('Login failed', true, loginMsgDiv));
});

function showUserSection() {
  document.getElementById('auth-section').style.display = 'none';
  userSection.style.display = '';
  adSection.style.display = '';
  userBar.style.display = '';

  if (isAdmin) {
    adSection.classList.add('left-panel');
    adminSection.classList.add('right-panel');
    adminSection.style.display = '';
    userSection.style.display = ''; // Ensure user-section is visible for admin split view
    fetchUsers();
  } else {
    adSection.classList.remove('left-panel');
    adminSection.classList.remove('right-panel');
    adminSection.style.display = 'none';
    // Hide user-section for non-admins
    userSection.style.display = 'none';
  }

  if (token && !isAdmin) {
    adForm.style.display = '';
  } else {
    adForm.style.display = 'none';
  }
  currentUserSpan.textContent = currentUser;
  fetchAds();
}

window.addEventListener('DOMContentLoaded', () => {
  adSection.style.display = '';
  adForm.style.display = 'none';
  userSection.style.display = 'none';
  userBar.style.display = 'none';
  fetchAds();
});

logoutBtn.addEventListener('click', () => {
  token = '';
  isAdmin = false;
  currentUser = '';
  userSection.style.display = 'none';
  adSection.style.display = '';
  adForm.style.display = 'none';
  userBar.style.display = 'none';
  document.getElementById('auth-section').style.display = '';

  // Remove admin/user split view classes and hide admin section
  adSection.classList.remove('left-panel');
  adminSection.classList.remove('right-panel');
  adminSection.style.display = 'none';

  fetchAds();
});

userSearchInput.addEventListener('input', filterAndRenderUsers);

function filterAndRenderUsers() {
  const query = userSearchInput.value.trim().toLowerCase();
  let filtered = allUsers;
  if (query) {
    filtered = allUsers.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }
  renderUsers(filtered);
}

function renderUsers(users) {
  userTableBody.innerHTML = '';
  // Add a message div above the table for user edit confirmations
  let userMsgDiv = document.getElementById('user-message');
  if (!userMsgDiv) {
    userMsgDiv = document.createElement('div');
    userMsgDiv.id = 'user-message';
    userMsgDiv.className = 'form-message';
    userTableBody.parentElement.parentElement.insertBefore(userMsgDiv, userTableBody.parentElement);
  }
  users.forEach(user => {
    const tr = document.createElement('tr');
    // Name
    const tdName = document.createElement('td');
    tdName.textContent = user.name;
    tr.appendChild(tdName);
    // Email
    const tdEmail = document.createElement('td');
    tdEmail.textContent = user.email;
    tr.appendChild(tdEmail);
    // Admin
    const tdAdmin = document.createElement('td');
    tdAdmin.textContent = user.isAdmin ? 'Yes' : 'No';
    tr.appendChild(tdAdmin);
    // Actions
    const tdActions = document.createElement('td');
    if (!user.isAdmin) {
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => editUser(user, userMsgDiv);
      tdActions.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => deleteUser(user._id);
      tdActions.appendChild(deleteBtn);

      const recoverBtn = document.createElement('button');
      recoverBtn.className = 'recover-btn';
      recoverBtn.textContent = 'Recover Password';
      recoverBtn.onclick = () => recoverPassword(user);
      tdActions.appendChild(recoverBtn);

      const clearBtn = document.createElement('button');
      clearBtn.className = 'clear-btn';
      clearBtn.textContent = 'Clear All Data';
      clearBtn.onclick = () => clearAllData(user);
      tdActions.appendChild(clearBtn);
    }
    tr.appendChild(tdActions);
    userTableBody.appendChild(tr);
  });
}

function editUser(user, userMsgDiv) {
  showModal(
    modal => {
      modal.appendChild(document.createTextNode('Edit user details:'));
      modal.appendChild(document.createElement('br'));

      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Name:';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = user.name;
      nameLabel.appendChild(nameInput);
      modal.appendChild(nameLabel);
      modal.appendChild(document.createElement('br'));

      const emailLabel = document.createElement('label');
      emailLabel.textContent = 'Email:';
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.value = user.email;
      emailLabel.appendChild(emailInput);
      modal.appendChild(emailLabel);
      modal.appendChild(document.createElement('br'));

      const adminLabel = document.createElement('label');
      const adminCheckbox = document.createElement('input');
      adminCheckbox.type = 'checkbox';
      adminCheckbox.checked = !!user.isAdmin;
      adminLabel.appendChild(adminCheckbox);
      adminLabel.appendChild(document.createTextNode(' Make user admin'));
      modal.appendChild(adminLabel);
      modal.appendChild(document.createElement('br'));

      // Buttons
      const saveBtn = document.createElement('button');
      saveBtn.className = 'custom-modal-btn save modal-confirm';
      saveBtn.textContent = 'Save';
      modal.appendChild(saveBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'custom-modal-btn cancel modal-cancel';
      cancelBtn.textContent = 'Cancel';
      modal.appendChild(cancelBtn);
    },
    // onConfirm
    async () => {
      const modal = modalBox;
      const nameInput = modal.querySelector('label input[type="text"]');
      const emailInput = modal.querySelector('label input[type="email"]');
      const adminCheckbox = modal.querySelector('label input[type="checkbox"]');
      const newName = nameInput.value.trim();
      const newEmail = emailInput.value.trim();
      const isAdminChecked = adminCheckbox.checked;

      if (!newName || !newEmail) {
        showMessage('Name and email are required.', true, userMsgDiv);
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/${user._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newName,
            email: newEmail,
            isAdmin: isAdminChecked
          })
        });
        const data = await res.json();
        if (!res.ok || data.error || data.message === 'User not found') {
          showMessage(data.error || data.message || 'Failed to update user', true, userMsgDiv);
        } else {
          showMessage('User was edited successfully!', false, userMsgDiv);
          fetchUsers();
          closeModal();
        }
      } catch (err) {
        showMessage('Failed to update user', true, userMsgDiv);
      }
    },
    // onCancel
    closeModal
  );
}
function deleteUser(id) {
  showModal(
    modal => {
      modal.appendChild(document.createTextNode('Are you sure you want to delete this user?'));
      modal.appendChild(document.createElement('br'));
      // Message area for delete user
      const deleteMsgDiv = document.createElement('div');
      deleteMsgDiv.className = 'form-message';
      deleteMsgDiv.style.margin = '8px 0';
      modal.appendChild(deleteMsgDiv);

      const yesBtn = document.createElement('button');
      yesBtn.className = 'custom-modal-btn delete modal-confirm';
      yesBtn.textContent = 'Yes';
      modal.appendChild(yesBtn);
      const noBtn = document.createElement('button');
      noBtn.className = 'custom-modal-btn cancel modal-cancel';
      noBtn.textContent = 'No';
      modal.appendChild(noBtn);
    },
    // onConfirm
    async () => {
      const modal = modalBox;
      const deleteMsgDiv = modal.querySelector('.form-message');
      try {
        const res = await fetch(`${apiUrl}/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        let data = {};
        try {
          data = await res.json();
        } catch (err) {}
        if (!res.ok || data.error || data.message === 'User not found') {
          showMessage(data.error || data.message || 'Failed to delete user', true, deleteMsgDiv);
        } else {
          showMessage('User deleted!', false, deleteMsgDiv);
          fetchUsers();
          fetchAds();
          setTimeout(() => closeModal(), 1200);
        }
      } catch (err) {
        showMessage('Failed to delete user', true, deleteMsgDiv);
      }
    },
    // onCancel
    closeModal
  );
}

function recoverPassword(user) {
  showModal(
    modal => {
      modal.appendChild(document.createTextNode(`Set password for "${user.name}" to "recover${user.name}"?`));
      modal.appendChild(document.createElement('br'));
      // Message area for recover password
      const recoverMsgDiv = document.createElement('div');
      recoverMsgDiv.className = 'form-message';
      recoverMsgDiv.style.margin = '8px 0';
      modal.appendChild(recoverMsgDiv);

      const yesBtn = document.createElement('button');
      yesBtn.className = 'custom-modal-btn save modal-confirm';
      yesBtn.textContent = 'Yes';
      modal.appendChild(yesBtn);
      const noBtn = document.createElement('button');
      noBtn.className = 'custom-modal-btn cancel modal-cancel';
      noBtn.textContent = 'No';
      modal.appendChild(noBtn);
    },
    // onConfirm
    async () => {
      const modal = modalBox;
      const recoverMsgDiv = modal.querySelector('.form-message');
      try {
        const res = await fetch(`${apiUrl}/${user._id}/recover`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        let data = {};
        try {
          data = await res.json();
        } catch (err) {}
        if (!res.ok || data.error) {
          showMessage(data.error || data.message || 'Failed to recover password', true, recoverMsgDiv);
        } else {
          showMessage(data.message || 'Password recovered!', false, recoverMsgDiv);
          setTimeout(() => closeModal(), 1200);
        }
      } catch (err) {
        showMessage('Failed to recover password', true, recoverMsgDiv);
      }
    },
    // onCancel
    closeModal
  );
}

function clearAllData(user) {
  showModal(
    modal => {
      modal.appendChild(document.createTextNode(`Are you sure you want to delete user "${user.name}" and ALL their posts?`));
      modal.appendChild(document.createElement('br'));
      // Message area for clear all data
      const clearMsgDiv = document.createElement('div');
      clearMsgDiv.className = 'form-message';
      clearMsgDiv.style.margin = '8px 0';
      modal.appendChild(clearMsgDiv);

      const yesBtn = document.createElement('button');
      yesBtn.className = 'custom-modal-btn delete modal-confirm';
      yesBtn.textContent = 'Yes';
      modal.appendChild(yesBtn);
      const noBtn = document.createElement('button');
      noBtn.className = 'custom-modal-btn cancel modal-cancel';
      noBtn.textContent = 'No';
      modal.appendChild(noBtn);
    },
    // onConfirm
    async () => {
      const modal = modalBox;
      const clearMsgDiv = modal.querySelector('.form-message');
      try {
        const res = await fetch(`${apiUrl}/${user._id}/clear`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        let data = {};
        try {
          data = await res.json();
        } catch (err) {}
        if (!res.ok || data.error || data.message === 'User not found') {
          showMessage(data.error || data.message || 'Failed to delete user and posts', true, clearMsgDiv);
        } else {
          showMessage('User and all posts deleted!', false, clearMsgDiv);
          fetchUsers();
          fetchAds();
          setTimeout(() => closeModal(), 1200);
        }
      } catch (err) {
        showMessage('Failed to delete user and posts', true, clearMsgDiv);
      }
    },
    // onCancel
    closeModal
  );
}

// --- Edit Profile ---
editProfileBtn.addEventListener('click', async () => {
  // Fetch current user profile to get the current email
  let currentEmail = '';
  try {
    const res = await fetch(`${apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      currentEmail = data.email || '';
    }
  } catch (err) {
    // fallback: leave currentEmail as empty string
  }

  showModal(
    modal => {
      modal.appendChild(document.createTextNode('Edit your profile:'));
      modal.appendChild(document.createElement('br'));

      const emailLabel = document.createElement('label');
      emailLabel.textContent = 'New Email:';
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.placeholder = 'Enter new email (leave blank to keep current)';
      emailInput.value = currentEmail; // Pre-fill with current email
      emailLabel.appendChild(emailInput);
      modal.appendChild(emailLabel);
      modal.appendChild(document.createElement('br'));

      const passwordLabel = document.createElement('label');
      passwordLabel.textContent = 'New Password:';
      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.placeholder = 'Enter new password (leave blank to keep current)';
      passwordLabel.appendChild(passwordInput);
      modal.appendChild(passwordLabel);
      modal.appendChild(document.createElement('br'));

      const currentPasswordLabel = document.createElement('label');
      currentPasswordLabel.textContent = 'Current Password (required to save):';
      const currentPasswordInput = document.createElement('input');
      currentPasswordInput.type = 'password';
      currentPasswordInput.placeholder = 'Enter current password';
      currentPasswordLabel.appendChild(currentPasswordInput);
      modal.appendChild(currentPasswordLabel);
      modal.appendChild(document.createElement('br'));

      // Buttons
      const saveBtn = document.createElement('button');
      saveBtn.className = 'custom-modal-btn save modal-confirm';
      saveBtn.textContent = 'Save';
      modal.appendChild(saveBtn);

      // Message area for profile edit
      const profileMsgDiv = document.createElement('div');
      profileMsgDiv.id = 'profile-message';
      profileMsgDiv.className = 'form-message';
      profileMsgDiv.style.marginTop = '8px';
      modal.appendChild(profileMsgDiv);

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'custom-modal-btn cancel modal-cancel';
      cancelBtn.textContent = 'Cancel';
      modal.appendChild(cancelBtn);
    },
    // onConfirm
    async () => {
      const modal = modalBox;
      const emailInput = modal.querySelector('label input[type="email"]');
      const passwordInput = modal.querySelector('label input[type="password"]:not([placeholder="Enter current password"])');
      const currentPasswordInput = modal.querySelector('label input[placeholder="Enter current password"]');
      const profileMsgDiv = modal.querySelector('#profile-message');
      const newEmail = emailInput.value.trim();
      const newPassword = passwordInput.value;
      const currentPassword = currentPasswordInput.value;
      if (!currentPassword) {
        showMessage('Current password is required.', true, profileMsgDiv);
        return;
      }
      if (!newEmail && !newPassword) {
        showMessage('No changes made.', false, profileMsgDiv);
        return;
      }
      try {
        const res = await fetch(`${apiUrl}/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ email: newEmail, password: newPassword, currentPassword })
        });
        let data = {};
        try {
          data = await res.json();
        } catch (err) {
          // fallback if no json
        }
        if (!res.ok || data.error || data.message === 'User not found') {
          showMessage(data.error || data.message || 'Failed to update profile', true, profileMsgDiv);
        } else {
          // Always show a confirmation, regardless of backend message
          showMessage('Edit successful!', false, profileMsgDiv);
          setTimeout(() => {
            closeModal();
          }, 1200);
        }
      } catch (err) {
        showMessage('Failed to update profile', true, profileMsgDiv);
      }
    },
    // onCancel
    closeModal
  );
}
);

// --- Ads ---
adForm.addEventListener('submit', e => {
  e.preventDefault();
  const title = document.getElementById('adTitle').value.trim();
  const price = document.getElementById('adPrice').value;
  const description = document.getElementById('adDescription').value.trim();
  const adMsgDiv = document.getElementById('ad-message');
  fetch('/api/ads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, price, description })
  })
    .then(res => res.json())
    .then(data => {
      if (data._id) {
        showMessage('Ad created!', false, adMsgDiv);
        adForm.reset();
        fetchAds();
      } else {
        showMessage(data.message || 'Failed to create ad', true, adMsgDiv);
      }
    })
    .catch(() => showMessage('Failed to create ad', true, adMsgDiv));
});

function fetchAds() {
  fetch('/api/ads')
    .then(res => res.json())
    .then(ads => {
      allAds = ads;
      filterAndRenderAds();
    })
    .catch(() => showMessage('Failed to fetch ads', true));
}

adSearchInput.addEventListener('input', filterAndRenderAds);
adMinPrice.addEventListener('input', filterAndRenderAds);
adMaxPrice.addEventListener('input', filterAndRenderAds);

function filterAndRenderAds() {
  const query = adSearchInput.value.trim().toLowerCase();
  const minPrice = parseFloat(adMinPrice.value);
  const maxPrice = parseFloat(adMaxPrice.value);

  let filtered = allAds;

  // Filter by title
  if (query) {
    filtered = filtered.filter(ad =>
      ad.title && ad.title.toLowerCase().includes(query)
    );
  }

  // Filter by price
  filtered = filtered.filter(ad => {
    const price = Number(ad.price);
    if (!isNaN(minPrice) && price < minPrice) return false;
    if (!isNaN(maxPrice) && price > maxPrice) return false;
    return true;
  });

  renderAds(filtered);
}

function renderAds(ads) {
  adsList.innerHTML = '';
  if (!ads.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'No ads yet.';
    tr.appendChild(td);
    adsList.appendChild(tr);
    return;
  }

  // If logged in, show user's ads first
  let sortedAds = ads;
  if (token && currentUser) {
    const userAds = ads.filter(ad => ad.user && ad.user.name === currentUser);
    const otherAds = ads.filter(ad => !ad.user || ad.user.name !== currentUser);
    sortedAds = [...userAds, ...otherAds];
  }

  // Show/hide actions column
  adsActionsHeader.style.display = (isAdmin || token) ? '' : 'none';

  sortedAds.forEach(ad => {
    const tr = document.createElement('tr');
    // Title
    const tdTitle = document.createElement('td');
    tdTitle.textContent = ad.title;
    tr.appendChild(tdTitle);
    // Price
    const tdPrice = document.createElement('td');
    tdPrice.textContent = ad.price;
    tr.appendChild(tdPrice);
    // Description
    const tdDesc = document.createElement('td');
    tdDesc.textContent = ad.description;
    tr.appendChild(tdDesc);
    // Poster
    const tdPoster = document.createElement('td');
    tdPoster.textContent = ad.user && ad.user.name ? ad.user.name : 'Removed';
    tr.appendChild(tdPoster);
    // Actions
    if (isAdmin) {
      const tdActions = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => deleteAd(ad._id);
      tdActions.appendChild(deleteBtn);
      tr.appendChild(tdActions);
    } else if (token && ad.user && ad.user.name === currentUser) {
      const tdActions = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.className = 'edit-btn';
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => editAd(ad);
      tdActions.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => deleteAd(ad._id);
      tdActions.appendChild(deleteBtn);

      tr.appendChild(tdActions);
    } else if (token) {
      tr.appendChild(document.createElement('td'));
    }
    adsList.appendChild(tr);
  });
}

function editAd(ad) {
  showModal(
    modal => {
      modal.appendChild(document.createTextNode('Edit your ad:'));
      modal.appendChild(document.createElement('br'));

      const titleLabel = document.createElement('label');
      titleLabel.textContent = 'Title:';
      const titleInput = document.createElement('input');
      titleInput.type = 'text';
      titleInput.value = ad.title;
      titleLabel.appendChild(titleInput);
      modal.appendChild(titleLabel);
      modal.appendChild(document.createElement('br'));

      const priceLabel = document.createElement('label');
      priceLabel.textContent = 'Price (€):';
      const priceInput = document.createElement('input');
      priceInput.type = 'number';
      priceInput.value = ad.price;
      priceLabel.appendChild(priceInput);
      modal.appendChild(priceLabel);
      modal.appendChild(document.createElement('br'));

      const descLabel = document.createElement('label');
      descLabel.textContent = 'Description:';
      const descInput = document.createElement('textarea');
      descInput.value = ad.description;
      descLabel.appendChild(descInput);
      modal.appendChild(descLabel);
      modal.appendChild(document.createElement('br'));

      // Message area for ad edit
      const adEditMsgDiv = document.createElement('div');
      adEditMsgDiv.className = 'form-message';
      adEditMsgDiv.style.marginTop = '8px';
      modal.appendChild(adEditMsgDiv);

      // Buttons
      const saveBtn = document.createElement('button');
      saveBtn.className = 'custom-modal-btn save modal-confirm';
      saveBtn.textContent = 'Save';
      modal.appendChild(saveBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'custom-modal-btn cancel modal-cancel';
      cancelBtn.textContent = 'Cancel';
      modal.appendChild(cancelBtn);
    },
    // onConfirm
    async () => {
      const modal = modalBox;
      const titleInput = modal.querySelector('label input[type="text"]');
      const priceInput = modal.querySelector('label input[type="number"]');
      const descInput = modal.querySelector('label textarea');
      const adEditMsgDiv = modal.querySelector('.form-message');
      const newTitle = titleInput.value.trim();
      const newPrice = priceInput.value;
      const newDesc = descInput.value.trim();
      if (!newTitle || !newPrice || !newDesc) {
        showMessage('All fields are required.', true, adEditMsgDiv);
        return;
      }
      try {
        const res = await fetch(`/api/ads/${ad._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title: newTitle, price: newPrice, description: newDesc })
        });
        let data = {};
        try {
          data = await res.json();
        } catch (err) {}
        if (!res.ok || data.error || data.message === 'Ad not found') {
          showMessage(data.error || data.message || 'Failed to update ad', true, adEditMsgDiv);
        } else {
          showMessage('Ad updated!', false, adEditMsgDiv);
          fetchAds();
          setTimeout(() => closeModal(), 1200);
        }
      } catch (err) {
        showMessage('Failed to update ad', true, adEditMsgDiv);
      }
    },
    // onCancel
    closeModal
  );
}
function deleteAd(adId) {
  showModal(modal => {
    modal.appendChild(document.createTextNode('Are you sure you want to delete this ad?'));
    modal.appendChild(document.createElement('br'));
    const yesBtn = document.createElement('button');
    yesBtn.className = 'custom-modal-btn delete modal-confirm';
    yesBtn.textContent = 'Yes';
    modal.appendChild(yesBtn);
    const noBtn = document.createElement('button');
    noBtn.className = 'custom-modal-btn cancel modal-cancel';
    noBtn.textContent = 'No';
    modal.appendChild(noBtn);

    yesBtn.onclick = () => {
      fetch(`/api/ads/${adId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.error || data.message === 'Ad not found') {
            showMessage(data.error || data.message, true);
          } else {
            showMessage('Ad deleted!');
            fetchAds();
            closeModal();
          }
        });
    };
    noBtn.onclick = closeModal;
  });
}