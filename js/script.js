// Add a console log at the very beginning to confirm script execution
console.log("script.js loaded and executing.");

// Firebase configuration from the user's prompt
const firebaseConfig = {
    apiKey: "AIzaSyD4ja8kpnQNeWhfpgcKsbC9UNOyVC_ibyo",
    authDomain: "toancreator-online-chat.firebaseapp.com",
    projectId: "toancreator-online-chat",
    storageBucket: "toancreator-online-chat.firebasestorage.app",
    messagingSenderId: "683126416659",
    appId: "1:683126416659:web:2fe64da2f203dac119e6e6",
    measurementId: "G-4ZYYCLPSF5"
};

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, addDoc, getDocs, serverTimestamp, writeBatch } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// App ID from Canvas environment (if available)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'toancreator-online-chat';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const chatNowBtn = document.getElementById('chat-now-btn');
const authModal = document.getElementById('auth-modal');
const termsModal = document.getElementById('terms-modal');
const chatInterface = document.getElementById('chat-interface');
const fullNameInput = document.getElementById('full-name');
const setupBtn = document.getElementById('setup-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const agreeTermsCheckbox = document.getElementById('agree-terms');
const startChatBtn = document.getElementById('start-chat-btn');
const closeButtons = document.querySelectorAll('.close-button');
const userNameDisplay = document.querySelector('.user-name');
const userIdDisplay = document.querySelector('.user-id');
const accountCreationTimeDisplay = document.querySelector('.account-creation-time');
const themeSwitch = document.getElementById('theme-switch');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const groupNameDisplay = document.querySelector('.group-name-display');
const contactList = document.querySelector('.contact-list');
const createJoinGroupBtn = document.querySelector('.create-join-group');
const uploadImageBtn = document.getElementById('upload-image-btn');

// Chat interface modals and buttons
const createJoinGroupModal = document.getElementById('create-join-group-modal');
const showCreateGroupFormBtn = document.getElementById('show-create-group-form');
const showJoinGroupFormBtn = document.getElementById('show-join-group-form');
const createGroupForm = document.getElementById('create-group-form');
const joinGroupForm = document.getElementById('join-group-form');
const newGroupNameInput = document.getElementById('new-group-name');
const newGroupPasswordInput = document.getElementById('new-group-password');
const createGroupBtn = document.getElementById('create-group-btn');
const joinGroupIdInput = document.getElementById('join-group-id');
const joinGroupBtn = document.getElementById('join-group-btn');

const groupInfoBtn = document.getElementById('group-info-btn');
const groupInfoModal = document.getElementById('group-info-modal');
const infoGroupName = document.getElementById('info-group-name');
const infoGroupCreator = document.getElementById('info-group-creator');
const infoGroupId = document.getElementById('info-group-id');
const infoGroupCreationDate = document.getElementById('info-group-creation-date');
const infoMemberCount = document.getElementById('info-member-count');

const inviteUserBtn = document.getElementById('invite-user-btn');
const inviteUserModal = document.getElementById('invite-user-modal');
const inviteUserIdInput = document.getElementById('invite-user-id');
const sendInviteBtn = document.getElementById('send-invite-btn');

const deleteGroupBtn = document.getElementById('delete-group-btn');
const deleteGroupModal = document.getElementById('delete-group-modal');
const deleteGroupPasswordInput = document.getElementById('delete-group-password');
const confirmDeleteGroupBtn = document.getElementById('confirm-delete-group-btn');

const cmdBtn = document.getElementById('cmd-btn');
const adminCmdModal = document.getElementById('admin-cmd-modal');
const cmdInput = document.getElementById('cmd-input');
const executeCmdBtn = document.getElementById('execute-cmd-btn');
const cmdOutput = document.getElementById('cmd-output');
const cmdKeyboard = document.getElementById('cmd-keyboard');

const messageBox = document.getElementById('message-box');
const messageBoxText = document.getElementById('message-box-text');
const messageBoxOkBtn = document.getElementById('message-box-ok-btn');

// --- Global Variables ---
let currentUser = null;
let currentUserId = null;
let currentUserName = null;
let currentUserIsAdmin = false;
let userIpAddress = 'unknown';
let activeGroupId = 'default-group';
let activeGroupData = null;
const adminEmails = ['tranhoangtoan2k8@gmail.com', 'lehuutam20122008@gmail.com', 'emailracvl5@gmail.com'];
const userColorMap = {};
let countdownInterval = null;
let firebaseAuthChecked = false;

// Add a flag to prevent multiple UI setup calls
let isUIInitialized = false;
let isFirebaseInitialized = false;

// --- Utility Functions ---

/**
 * Displays a custom message box.
 * @param {string} message - The message to display.
 */
function showMessageBox(message) {
    messageBoxText.textContent = message;
    messageBox.style.display = 'flex';
}

/**
 * Hides the custom message box.
 */
function hideMessageBox() {
    messageBox.style.display = 'none';
}

messageBoxOkBtn.addEventListener('click', hideMessageBox);

/**
 * Toggles the visibility of a modal.
 * @param {HTMLElement} modalElement - The modal element to toggle.
 * @param {boolean} show - True to show, false to hide.
 */
function toggleModal(modalElement, show) {
    modalElement.style.display = show ? 'flex' : 'none';
    if (!show) {
        if (typeof grecaptcha !== 'undefined' && modalElement.id === 'auth-modal') {
            grecaptcha.reset();
        }
    }
}

// Close buttons for all modals
closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const modal = event.target.closest('.modal');
        if (modal) {
            toggleModal(modal, false);
        }
    });
});

// Close modal when clicking outside content
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        toggleModal(event.target, false);
    }
});

/**
 * Generates a unique ID (UUID v4).
 * @returns {string} A unique ID.
 */
function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Generates a random hex color.
 * @returns {string} A hex color string (e.g., "#RRGGBB").
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * Gets a unique color for a given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {string} A unique hex color for the user.
 */
function getUserColor(userId) {
    if (!userColorMap[userId]) {
        userColorMap[userId] = getRandomColor();
    }
    return userColorMap[userId];
}

/**
 * Formats a timestamp into a readable date and time string, including relative times.
 * @param {firebase.firestore.Timestamp|Date|any} timestamp - The timestamp to format.
 * @returns {string} Formatted date and time.
 */
function formatTimestamp(timestamp) {
    let date;
    if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
        date = timestamp;
    } else {
        try {
            date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                date = new Date();
            }
        } catch (e) {
            console.warn("Invalid timestamp format, falling back to current date:", timestamp, e);
            date = new Date();
        }
    }

    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
        return "Vừa xong";
    } else if (diffMinutes < 60) {
        return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
    } else {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('vi-VN', options);
    }
}

/**
 * Validates full name input (allows Vietnamese characters, numbers, spaces, max 20 chars).
 * @param {string} name - The name to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidFullName(name) {
    return /^[a-zA-Z0-9\sÀÁẠẢÃĂẰẮẶẲẴÂẦẤẬẨẪÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐđ]{1,20}$/.test(name);
}

/**
 * Fetches user's IP address (placeholder, actual IP cannot be fetched directly from client-side JS).
 */
async function fetchUserIpAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIpAddress = data.ip;
        console.log("User IP Address:", userIpAddress);
    } catch (error) {
        console.warn("Could not fetch IP address. Using 'unknown'.", error);
        userIpAddress = 'unknown';
    }
}

// --- Firebase Authentication and User Management ---

// Initial sign-in logic
async function initializeAuth() {
    if (isFirebaseInitialized) {
        console.log("Firebase already initialized. Skipping re-initialization.");
        return;
    }

    console.log("Initializing Firebase Auth...");
    try {
        let userCredential;
        if (initialAuthToken) {
            userCredential = await signInWithCustomToken(auth, initialAuthToken);
            console.log("signInWithCustomToken SUCCESS. User UID:", userCredential.user.uid, "Email:", userCredential.user.email);
        } else {
            userCredential = await signInAnonymously(auth);
            console.log("signInAnonymously SUCCESS. User UID:", userCredential.user.uid);
        }
        isFirebaseInitialized = true;
    } catch (error) {
        console.error("Error during initial Firebase sign-in (initializeAuth):", error);
        showMessageBox(`Lỗi khởi tạo đăng nhập: ${error.code || error.message}. Vui lòng kiểm tra cấu hình Firebase Auth (đặc biệt là Anonymous Authentication).`);
        isFirebaseInitialized = true;
    }
}

/**
 * Loads user data from Firestore based on UID or IP.
 * @param {string} uid - The Firebase User ID.
 * @param {string} ip - The user's IP address.
 * @returns {Promise<object|null>} The user data object if loaded, otherwise null.
 */
async function loadUserData(uid, ip) {
    const userDocRef = doc(db, `artifacts/${appId}/users/${uid}/profile`, 'data');
    try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.ipAddress === ip || adminEmails.includes(userData.email)) {
                console.log("Existing user data loaded:", userData);
                return userData;
            } else {
                console.warn("IP address mismatch for existing user. Treating as new session.");
                return null;
            }
        } else {
            console.log("No existing user data found for UID:", uid);
            return null;
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        showMessageBox(`Lỗi khi tải dữ liệu người dùng: ${error.code || error.message}.`);
        return null;
    }
}

/**
 * Handles all UI and data loading after a successful login.
 * This function should only be called once per session.
 * @param {firebase.User} user - The Firebase User object.
 */
async function handleLoggedInState(user) {
    if (isUIInitialized) {
        console.log("UI already initialized. Skipping.");
        return;
    }

    currentUserId = user.uid;
    currentUserIsAdmin = adminEmails.includes(user.email);
    console.log("User logged in. UID:", currentUserId, "IsAdmin:", currentUserIsAdmin);
    
    // Admins are never paused
    if (currentUserIsAdmin) {
        cmdBtn.classList.remove('hidden');
    } else {
        cmdBtn.classList.add('hidden');
    }

    if (!userIpAddress || userIpAddress === 'unknown') {
        await fetchUserIpAddress();
    }

    try {
        const userLoadedData = await loadUserData(currentUserId, userIpAddress);
        if (!userLoadedData) {
            console.log("Authenticated user has no profile data. Showing registration form.");
            startScreen.classList.add('hidden');
            toggleModal(authModal, true);
            return;
        }

        currentUser = userLoadedData;
        currentUserName = currentUser.name;
        isUIInitialized = true;

        console.log("User session fully loaded. Displaying chat interface.");
        startScreen.classList.add('hidden');
        chatInterface.classList.remove('hidden');
        toggleModal(authModal, false);
        toggleModal(termsModal, false);

        updateUserProfileUI();
        loadUserGroups();
        await loadMessages(activeGroupId);

        // Setup real-time listener for current user's profile to handle pause/unpause/ban
        onSnapshot(doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, 'data'), (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                currentUser.isPaused = userData.isPaused;
                if (currentUserIsAdmin) {
                    currentUser.isPaused = false;
                }
                if (currentUser.isPaused) {
                    messageInput.disabled = true;
                    sendMessageBtn.disabled = true;
                    messageInput.placeholder = "Bạn đã bị khóa chat bởi Admin.";
                    createGroupBtn.disabled = true;
                    newGroupNameInput.disabled = true;
                    newGroupPasswordInput.disabled = true;
                    showMessageBox("Tài khoản của bạn đã bị tạm khóa chức năng chat bởi Admin.");
                } else {
                    messageInput.disabled = false;
                    sendMessageBtn.disabled = false;
                    messageInput.placeholder = "Nhập tin nhắn của bạn (tối đa 1000 từ)";
                    createGroupBtn.disabled = false;
                    newGroupNameInput.disabled = false;
                    newGroupPasswordInput.disabled = false;
                }
            } else {
                const banOverlay = document.getElementById('ban-overlay');
                if (banOverlay) {
                    banOverlay.style.display = 'flex';
                }
                chatInterface.style.pointerEvents = 'none';
            }
        }, (error) => {
            console.error("Error listening to user profile changes:", error);
        });

    } catch (error) {
        console.error("Error during UI initialization:", error);
        showMessageBox(`Lỗi khởi tạo giao diện: ${error.code || error.message}. Vui lòng thử lại.`);
        isUIInitialized = false;
        toggleModal(authModal, true);
    }
}

// Main Authentication State Listener
onAuthStateChanged(auth, async (user) => {
    console.log("onAuthStateChanged fired. User:", user ? user.uid : "null");
    if (user) {
        await handleLoggedInState(user);
    } else {
        isUIInitialized = false;
        startScreen.classList.add('hidden');
        chatInterface.classList.add('hidden');
        toggleModal(authModal, true);
    }
    firebaseAuthChecked = true;
    updateStartChatButtonState();
});

/**
 * Registers a new user and saves their data to Firestore.
 * @param {string} name - The user's chosen name.
 */
async function registerUser(name) {
    if (!auth.currentUser) {
        showMessageBox("Lỗi đăng kí: Không tìm thấy ID người dùng. Vui lòng thử lại sau ít phút hoặc tải lại trang.");
        console.error("Registration Error: currentUserId is null.");
        return;
    }

    try {
        console.log("Attempting to check for existing IP address...");
        const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
        const q = query(usersCollectionRef, where('profile.data.ipAddress', '==', userIpAddress));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty && !currentUserIsAdmin) {
            showMessageBox("Địa chỉ IP này đã được sử dụng để đăng kí tài khoản khác. Vui lòng sử dụng tài khoản đã đăng kí hoặc liên hệ admin.");
            console.warn("Registration blocked: IP address already registered by another user.");
            return;
        }
        console.log("IP address check passed.");

        const newUserData = {
            name: name,
            id: auth.currentUser.uid,
            ipAddress: userIpAddress,
            createdAt: serverTimestamp(),
            groups: ['default-group'],
            isAdmin: false,
            isPaused: false,
        };

        console.log("Attempting to set user profile document...");
        const userProfileDocRef = doc(db, `artifacts/${appId}/users/${auth.currentUser.uid}/profile`, 'data');
        await setDoc(userProfileDocRef, newUserData);
        console.log("User profile saved successfully.");
        
        console.log("Attempting to update/create default group...");
        const defaultGroupRef = doc(db, `artifacts/${appId}/public/data/groups`, 'default-group');
        const defaultGroupSnap = await getDoc(defaultGroupRef);

        if (defaultGroupSnap.exists()) {
            const groupData = defaultGroupSnap.data();
            const currentMembers = groupData.members || [];
            if (!currentMembers.includes(auth.currentUser.uid)) {
                await updateDoc(defaultGroupRef, {
                    members: [...currentMembers, auth.currentUser.uid]
                });
                console.log("User added to default group members.");
            }
        } else {
            const actualCreatorId = auth.currentUser.uid;
            const actualCreatorName = name;

            await setDoc(defaultGroupRef, {
                name: 'Dô la - ToanCreator',
                creatorId: actualCreatorId,
                creatorName: actualCreatorName,
                id: 'default-group',
                createdAt: serverTimestamp(),
                members: [auth.currentUser.uid],
                isPublic: true,
                password: null,
            });
            console.log("Default group created and user added.");
        }
        console.log("Default group setup complete.");
        
        // After successful registration, call the unified handler
        await handleLoggedInState(auth.currentUser);

        await sendSystemMessage(activeGroupId, `${name} vừa tham gia nhóm.`);
        showMessageBox("Đăng kí thành công! Chào mừng bạn đến với Dô La Chat.");

    } catch (e) {
        console.error("Error registering user or setting up default group: ", e);
        if (e.code) {
            showMessageBox(`Lỗi Firebase khi đăng kí: ${e.code}. Vui lòng kiểm tra Firebase Security Rules và phương thức xác thực.`);
        } else {
            showMessageBox("Đã xảy ra lỗi không xác định khi đăng kí. Vui lòng thử lại.");
        }
    }
}

/**
 * Updates the user profile information in the UI.
 */
function updateUserProfileUI() {
    if (currentUser) {
        userNameDisplay.textContent = currentUser.name;
        userIdDisplay.textContent = `Id: ${currentUser.id}`;
        accountCreationTimeDisplay.textContent = `Thời gian tạo: ${formatTimestamp(currentUser.createdAt)}`;
    }
}

/**
 * Loads and displays the list of groups the user belongs to.
 */
function loadUserGroups() {
    if (!currentUser || !currentUserId) {
        console.warn("Cannot load groups: currentUser or currentUserId is null.");
        return;
    }

    const userGroupsRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, 'data');

    onSnapshot(userGroupsRef, (docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            const groups = userData.groups || [];
            contactList.querySelectorAll('.group-item:not(.create-join-group)').forEach(el => el.remove());

            if (!groups.includes('default-group')) {
                groups.unshift('default-group');
            }

            groups.forEach(async (groupId) => {
                const groupRef = doc(db, `artifacts/${appId}/public/data/groups`, groupId);
                const groupSnap = await getDoc(groupRef);
                if (groupSnap.exists()) {
                    const groupData = groupSnap.data();
                    if (!document.querySelector(`.group-item[data-group-id="${groupId}"]`)) {
                        const groupItem = document.createElement('div');
                        groupItem.classList.add('contact-item', 'group-item');
                        if (groupId === activeGroupId) {
                            groupItem.classList.add('active');
                            groupNameDisplay.textContent = groupData.name;
                        }
                        groupItem.dataset.groupId = groupId;
                        groupItem.innerHTML = `
                            <div class="group-icon">${groupData.name.charAt(0).toUpperCase()}</div>
                            <span>${groupData.name}</span>
                        `;
                        groupItem.addEventListener('click', () => switchGroup(groupId, groupData.name));
                        contactList.appendChild(groupItem);
                    }
                }
            });
        } else {
            console.warn("User profile document does not exist for group loading.");
        }
    }, (error) => {
        console.error("Error loading user groups: ", error);
        showMessageBox(`Lỗi khi tải danh sách nhóm: ${error.code || error.message}.`);
    });
}

/**
 * Switches the active chat group.
 * @param {string} groupId - The ID of the group to switch to.
 * @param {string} groupName - The name of the group.
 */
async function switchGroup(groupId, groupName) {
    if (activeGroupId === groupId) return;
    const currentActive = document.querySelector(`.group-item.active`);
    if (currentActive) {
        currentActive.classList.remove('active');
    }
    const newActive = document.querySelector(`.group-item[data-group-id="${groupId}"]`);
    if (newActive) {
        newActive.classList.add('active');
    }
    activeGroupId = groupId;
    groupNameDisplay.textContent = groupName;
    chatMessages.innerHTML = '';
    await loadMessages(groupId);
    const groupDocRef = doc(db, `artifacts/${appId}/public/data/groups`, activeGroupId);
    try {
        const groupSnap = await getDoc(groupDocRef);
        if (groupSnap.exists()) {
            activeGroupData = groupSnap.data();
        } else {
            activeGroupData = null;
            console.warn("Active group data not found for:", groupId);
            showMessageBox("Không tìm thấy thông tin nhóm đang hoạt động.");
        }
    } catch (error) {
        console.error("Error fetching active group data:", error);
        showMessageBox(`Lỗi khi tải thông tin nhóm: ${error.code || error.message}.`);
    }
}

/**
 * Loads messages for a given group and sets up a real-time listener.
 * @param {string} groupId - The ID of the group to load messages for.
 * @returns {Promise<void>}
 */
function loadMessages(groupId) {
    return new Promise((resolve, reject) => {
        if (!db) {
            console.error("Firestore DB not initialized.");
            reject(new Error("Firestore DB not initialized."));
            return;
        }
        const messagesCollectionRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
        const q = query(messagesCollectionRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            chatMessages.innerHTML = '';
            const messages = [];
            snapshot.forEach(doc => {
                messages.push({ id: doc.id, ...doc.data() });
            });
            messages.sort((a, b) => (a.timestamp && b.timestamp) ? a.timestamp.toDate() - b.timestamp.toDate() : 0);
            messages.forEach(msg => {
                displayMessage(msg);
            });
            chatMessages.scrollTop = chatMessages.scrollHeight;
            resolve();
        }, (error) => {
            console.error("Error loading messages: ", error);
            showMessageBox(`Lỗi khi tải tin nhắn: ${error.code || error.message}.`);
            reject(error);
        });
        window.currentMessageUnsubscribe = unsubscribe;
    });
}

/**
 * Displays a single message in the chat interface.
 * @param {object} message - The message object to display.
 */
function displayMessage(message) {
    if (!message || !message.content) {
        console.warn("Attempted to display an invalid message:", message);
        return;
    }

    const isSystemMessage = message.senderId === 'system';
    const isCurrentUser = currentUser && message.senderId === currentUser.id;

    let messageClass = '';
    let senderName = message.senderName || 'Người dùng ẩn danh';
    let avatarContent = senderName.charAt(0).toUpperCase();
    let avatarColor = isSystemMessage ? '#FF5733' : getUserColor(message.senderId);

    if (isSystemMessage) {
        messageClass = 'system-message';
        avatarContent = '🔔';
    } else if (isCurrentUser) {
        messageClass = 'sent';
    } else {
        messageClass = 'received';
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', messageClass);
    if (!isSystemMessage) {
        messageElement.setAttribute('data-user-id', message.senderId);
        messageElement.setAttribute('data-message-id', message.id);
    }
    
    // Check if the message is a link to an image
    const imageRegex = /^(https?:\/\/.*\.(?:png|jpe?g|gif|webp|bmp))$/i;
    const isImageLink = imageRegex.test(message.content);

    let messageContent = '';
    if (isImageLink) {
        messageContent = `<a href="${message.content}" target="_blank" rel="noopener noreferrer"><img src="${message.content}" alt="Hình ảnh người dùng" class="chat-image"></a>`;
    } else {
        const contentWithLinks = message.content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        messageContent = `<p>${contentWithLinks}</p>`;
    }
    
    // SỬA LỖI: Thêm điều kiện isCurrentUser vào HTML để hiển thị đúng layout
    messageElement.innerHTML = `
        <div class="message-sender-avatar" style="background-color: ${avatarColor};">
            ${avatarContent}
        </div>
        <div class="message-content-container">
            <div class="message-header">
                <span class="message-sender-name">${senderName}</span>
                <span class="message-time">${formatTimestamp(message.timestamp)}</span>
            </div>
            <div class="message-body">
                ${messageContent}
            </div>
        </div>
    `;

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Sends a new message to the active group.
 */
async function sendMessage() {
    const content = messageInput.value.trim();
    if (content === "" || !currentUser || !activeGroupId || currentUser.isPaused) {
        return;
    }

    if (content.length > 1000) {
        showMessageBox("Tin nhắn quá dài! Vui lòng chỉ nhập tối đa 1000 từ.");
        return;
    }

    try {
        const messagesCollectionRef = collection(db, `artifacts/${appId}/public/data/groups/${activeGroupId}/messages`);
        await addDoc(messagesCollectionRef, {
            senderId: currentUser.id,
            senderName: currentUser.name,
            content: content,
            timestamp: serverTimestamp(),
            groupId: activeGroupId
        });
        messageInput.value = "";
    } catch (e) {
        console.error("Error sending message: ", e);
        showMessageBox(`Đã xảy ra lỗi khi gửi tin nhắn: ${e.code || e.message}.`);
    }
}

/**
 * Sends a system-generated message to a group.
 * @param {string} groupId - The ID of the group to send the message to.
 * @param {string} content - The content of the system message.
 */
async function sendSystemMessage(groupId, content) {
    try {
        const messagesCollectionRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
        await addDoc(messagesCollectionRef, {
            senderId: 'system',
            senderName: 'Hệ thống',
            content: content,
            timestamp: serverTimestamp(),
            groupId: groupId
        });
    } catch (e) {
        console.error("Error sending system message: ", e);
    }
}

// --- Event Listeners ---

startChatBtn.disabled = true;
function updateStartChatButtonState() {
    startChatBtn.disabled = !agreeTermsCheckbox.checked || !firebaseAuthChecked;
}

agreeTermsCheckbox.addEventListener('change', updateStartChatButtonState);

startChatBtn.addEventListener('click', () => {
    if (agreeTermsCheckbox.checked) {
        toggleModal(termsModal, false);
        toggleModal(authModal, true);
    }
});

chatNowBtn.addEventListener('click', async () => {
    toggleModal(termsModal, true);
    if (!isFirebaseInitialized) {
        await initializeAuth();
    }
});

setupBtn.addEventListener('click', () => {
    const fullName = fullNameInput.value.trim();
    if (!isValidFullName(fullName)) {
        showMessageBox("Tên không hợp lệ! Vui lòng nhập tên từ 1-20 kí tự, không chứa kí tự đặc biệt.");
        return;
    }
    registerUser(fullName);
});

googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        if (!adminEmails.includes(user.email)) {
            showMessageBox("Bạn không có quyền Admin để đăng nhập bằng Google.");
            await signOut(auth);
            return;
        }

        showMessageBox("Đăng nhập Admin thành công!");
    } catch (error) {
        console.error("Google login error:", error);
        showMessageBox(`Đăng nhập Google thất bại: ${error.code || error.message}. Vui lòng thử lại.`);
    }
});

sendMessageBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

// Admin CMD functions
cmdBtn.addEventListener('click', () => {
    if (currentUserIsAdmin) {
        toggleModal(adminCmdModal, true);
    } else {
        showMessageBox("Bạn không phải là Admin.");
    }
});

// Admin commands logic
const cmdMap = {
    'help': async () => {
        return "Các lệnh Admin: ban [userId], unban [userId], groups, users";
    },
    'ban': async (args) => {
        if (args.length !== 1) {
            return "Lỗi cú pháp: ban [userId]";
        }
        const userId = args[0];
        try {
            await banUser(userId);
            return `Lệnh ban người dùng ${userId} đã được thực thi.`;
        } catch (e) {
            console.error("Ban command failed:", e);
            return `Lỗi khi ban người dùng ${userId}: ${e.message}`;
        }
    },
    'unban': async (args) => {
        if (args.length !== 1) {
            return "Lỗi cú pháp: unban [userId]";
        }
        const userId = args[0];
        try {
            await unbanUser(userId);
            return `Lệnh unban người dùng ${userId} đã được thực thi.`;
        } catch (e) {
            console.error("Unban command failed:", e);
            return `Lỗi khi unban người dùng ${userId}: ${e.message}`;
        }
    },
    'groups': async () => {
        const groupsCollectionRef = collection(db, `artifacts/${appId}/public/data/groups`);
        const querySnapshot = await getDocs(groupsCollectionRef);
        let output = "Danh sách nhóm:\n";
        querySnapshot.forEach(doc => {
            const data = doc.data();
            output += `- ${data.name} (ID: ${data.id}, Thành viên: ${data.members ? data.members.length : 0})\n`;
        });
        return output;
    },
    'users': async () => {
        const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
        const q = query(usersCollectionRef);
        const querySnapshot = await getDocs(q);
        let output = "Danh sách người dùng:\n";
        querySnapshot.forEach(doc => {
            const userData = doc.data().profile.data;
            const status = userData.isPaused ? "Đã khóa" : "Hoạt động";
            output += `- Tên: ${userData.name}, ID: ${userData.id}, IP: ${userData.ipAddress}, Trạng thái: ${status}\n`;
        });
        return output;
    },
};

executeCmdBtn.addEventListener('click', async () => {
    const cmdLine = cmdInput.value.trim();
    if (!cmdLine) return;
    cmdOutput.textContent += `> ${cmdLine}\n`;
    cmdInput.value = '';

    const parts = cmdLine.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (cmdMap[command]) {
        try {
            const result = await cmdMap[command](args);
            cmdOutput.textContent += result + '\n';
        } catch (e) {
            cmdOutput.textContent += `Lỗi khi thực thi lệnh: ${e.message}\n`;
            console.error(e);
        }
    } else {
        cmdOutput.textContent += `Lỗi: Lệnh không hợp lệ. Gõ 'help' để xem các lệnh.\n`;
    }
});

// Admin commands to ban and unban users
async function banUser(userId) {
    if (!currentUserIsAdmin) {
        throw new Error("Không có quyền Admin.");
    }
    const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
    const userSnap = await getDoc(userProfileRef);
    if (!userSnap.exists()) {
        throw new Error("Không tìm thấy người dùng này.");
    }
    const userData = userSnap.data();

    // SỬA LỖI: Cập nhật trường isPaused thành true
    const batch = writeBatch(db);
    batch.update(userProfileRef, { isPaused: true });

    await batch.commit();

    showMessageBox(`Người dùng ${userData.name} (ID: ${userId}) đã bị khóa chat.`);
    cmdOutput.textContent += `Người dùng ${userData.name} (ID: ${userId}) đã bị khóa chat.\\n`;
    await sendSystemMessage(activeGroupId, `Admin đã khóa chat của người dùng ${userData.name} (ID: ${userId}).`);
}

async function unbanUser(userId) {
    if (!currentUserIsAdmin) {
        throw new Error("Không có quyền Admin.");
    }
    const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
    const userSnap = await getDoc(userProfileRef);
    if (!userSnap.exists()) {
        throw new Error("Không tìm thấy người dùng này.");
    }
    const userData = userSnap.data();

    // SỬA LỖI: Cập nhật trường isPaused thành false
    const batch = writeBatch(db);
    batch.update(userProfileRef, { isPaused: false });

    await batch.commit();

    showMessageBox(`Người dùng ${userData.name} (ID: ${userId}) đã được mở khóa chat.`);
    cmdOutput.textContent += `Người dùng ${userData.name} (ID: ${userId}) đã được mở khóa chat.\\n`;
    await sendSystemMessage(activeGroupId, `Admin đã mở khóa chat của người dùng ${userData.name} (ID: ${userId}).`);
}

// Function to handle the full ban/delete process
async function executeFullBan(userId) {
    if (!currentUserIsAdmin) {
        throw new Error("Không có quyền Admin.");
    }
    
    cmdOutput.textContent += `Bắt đầu quá trình cấm và xóa người dùng ${userId}...\\n`;
    
    const batch = writeBatch(db);
    const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
    
    const userSnap = await getDoc(userProfileRef);
    if (!userSnap.exists()) {
        cmdOutput.textContent += `Lỗi: Không tìm thấy người dùng với ID ${userId}.\\n`;
        showMessageBox(`Lỗi: Không tìm thấy người dùng với ID ${userId}.`);
        return;
    }
    const userData = userSnap.data();
    
    // 1. Remove the user from all groups
    cmdOutput.textContent += `Đang xóa người dùng ${userId} khỏi các nhóm...\\n`;
    const groupsRef = collection(db, `artifacts/${appId}/public/data/groups`);
    const groupsQuery = query(groupsRef, where('members', 'array-contains', userId));
    const groupSnapshots = await getDocs(groupsQuery);
    
    const groupUpdates = [];
    groupSnapshots.forEach(groupDoc => {
        const members = groupDoc.data().members || [];
        const updatedMembers = members.filter(member => member !== userId);
        batch.update(groupDoc.ref, { members: updatedMembers });
        groupUpdates.push(groupDoc.id);
    });
    cmdOutput.textContent += `- Đã xóa khỏi ${groupUpdates.length} nhóm: ${groupUpdates.join(', ')}\\n`;
    
    // 2. Delete messages sent by the user in all public groups
    cmdOutput.textContent += `Đang xóa tin nhắn của người dùng ${userId}...\\n`;
    const allPublicGroupsRef = collection(db, `artifacts/${appId}/public/data/groups`);
    const allPublicGroupsSnap = await getDocs(allPublicGroupsRef);
    const messagesToDelete = [];

    for (const doc of allPublicGroupsSnap.docs) {
        const groupId = doc.id;
        const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
        const q = query(messagesRef, where('senderId', '==', userId));
        const snapshot = await getDocs(q);
        snapshot.forEach((msgDoc) => {
            messagesToDelete.push(msgDoc.ref);
        });
    }
    messagesToDelete.forEach(msgRef => batch.delete(msgRef));
    if (messagesToDelete.length > 0) {
        cmdOutput.textContent += `- Đã xóa ${messagesToDelete.length} tin nhắn của người dùng ${userId}.\\n`;
    } else {
        cmdOutput.textContent += `- Không tìm thấy tin nhắn nào của người dùng ${userId} để xóa.\\n`;
    }

    // 3. Delete the user's profile document
    cmdOutput.textContent += `Đang xóa hồ sơ người dùng ${userId}...\\n`;
    batch.delete(userProfileRef);

    try {
        await batch.commit();
        showMessageBox(`Người dùng ${userData.name} (ID: ${userId}) đã bị cấm và xóa khỏi hệ thống.`);
        cmdOutput.textContent += `Người dùng ${userData.name} (ID: ${userId}) đã bị cấm và xóa khỏi hệ thống.\\n`;
        await sendSystemMessage(activeGroupId, `Admin đã cấm và xóa người dùng ${userData.name} (ID: ${userId}) khỏi hệ thống.`);
    } catch (e) {
        console.error("Error banning user:", e);
        showMessageBox(`Đã xảy ra lỗi khi cấm người dùng ${userId}: ${e.code || e.message}. Vui lòng thử lại.`);
        cmdOutput.textContent += `Lỗi khi cấm người dùng ${userId}: ${e.message}. Vui lòng kiểm tra lại quyền truy cập Firebase.\\n`;
    }
}

// Event listener for the ban command in the UI (e.g., in a context menu)
// Example usage:
// banUserFromUIBtn.addEventListener('click', () => {
//    const userIdToBan = 'some-user-id'; // Get this from the UI
//    executeFullBan(userIdToBan);
// });

// Function to handle image upload
uploadImageBtn.addEventListener('click', async () => {
    showMessageBox("Chức năng tải ảnh lên hiện tại chưa được hỗ trợ. Vui lòng dán link ảnh vào ô chat để chia sẻ.");
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Hide all main content areas initially
    startScreen.classList.remove('hidden');
    chatInterface.classList.add('hidden');
    authModal.classList.add('hidden');
    termsModal.classList.add('hidden');
    createJoinGroupModal.classList.add('hidden');
    groupInfoModal.classList.add('hidden');
    inviteUserModal.classList.add('hidden');
    deleteGroupModal.classList.add('hidden');
    adminCmdModal.classList.add('hidden');
    messageBox.classList.add('hidden');
    
    // Initial call to fetch IP and auth
    initializeAuth();
    fetchUserIpAddress();

    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('userId');
    const groupIdFromUrl = urlParams.get('groupId');
    
    if (userIdFromUrl && groupIdFromUrl) {
        // Handle invite links if needed, or simply log them
        console.log(`Received invite link for User ID: ${userIdFromUrl} and Group ID: ${groupIdFromUrl}`);
    }
});