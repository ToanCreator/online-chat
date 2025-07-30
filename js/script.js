// Add a console log at the very beginning to confirm script execution
console.log("script.js loaded and executing.");

// Firebase configuration from the user's prompt
const firebaseConfig = {
    apiKey: "AIzaSyD4ja8kpnQNeWhfpgcKsbC9UNOyVC_ibyo",
    authDomain: "toancreator-online-chat.firebaseapp.com",
    projectId: "toancreator-online-chat",
    storageBucket: "toancreator-online-chat.firebaseapp.com",
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
const termsCountdownDisplay = document.getElementById('terms-countdown'); // Added for countdown

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
let userIpAddress = 'unknown'; // Placeholder for IP address
let activeGroupId = 'default-group'; // Default group ID
let activeGroupData = null; // Stores data for the currently active group

// Flags to manage Firebase and UI state
let firebaseAuthChecked = false; // True when onAuthStateChanged has run at least once
let isFirebaseInitialized = false; // True when Firebase app and services are initialized
let isUserSessionLoaded = false; // True when user data (currentUser) is loaded from Firestore

const adminEmails = ['tranhoangtoan2k8@gmail.com', 'lehuutam20122008@gmail.com'];
const userColorMap = {}; // Map to store unique colors for user IDs

let termsCountdownTimer = null; // Timer for the terms modal countdown
let termsCountdownFinished = false; // New flag for countdown status

// --- Utility Functions ---

/**
 * Displays a custom message box.
 * @param {string} message - The message to display.
 * @param {boolean} [dismissible=true] - If true, the message box can be dismissed. If false, it cannot.
 */
function showMessageBox(message, dismissible = true) {
    messageBoxText.textContent = message;
    messageBox.style.display = 'flex';
    if (dismissible) {
        messageBoxOkBtn.classList.remove('hidden');
        messageBox.classList.remove('non-dismissible'); // Ensure it's dismissible
        messageBoxOkBtn.addEventListener('click', hideMessageBox, { once: true });
        // Add listener for outside click only for dismissible messageBox
        messageBox.addEventListener('click', dismissModalOutside);
    } else {
        messageBoxOkBtn.classList.add('hidden');
        messageBox.classList.add('non-dismissible'); // Mark as non-dismissible
        // Remove listener for outside click if it was there
        messageBox.removeEventListener('click', dismissModalOutside);
    }
}

/**
 * Hides the custom message box.
 */
function hideMessageBox() {
    messageBox.style.display = 'none';
    messageBoxOkBtn.classList.remove('hidden');
    messageBox.classList.remove('non-dismissible'); // Reset for next time
    messageBoxOkBtn.removeEventListener('click', hideMessageBox);
    // Ensure listener for outside click is removed when hiding the message box
    messageBox.removeEventListener('click', dismissModalOutside);
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

/**
 * Function to handle clicking outside a modal to close it.
 * @param {Event} event - The click event.
 */
window.addEventListener('click', (event) => {
    // Only dismiss if the clicked element is a modal background AND it's not the messageBox
    if (event.target.classList.contains('modal') && event.target !== messageBox) {
        toggleModal(event.target, false);
    }
});


/**
 * Toggles the visibility of a modal.
 * @param {HTMLElement} modalElement - The modal element to toggle.
 * @param {boolean} show - True to show, false to hide.
 */
function toggleModal(modalElement, show) {
    modalElement.style.display = show ? 'flex' : 'none';
    if (!show) {
        // Reset reCAPTCHA when auth modal is closed
        if (typeof grecaptcha !== 'undefined' && modalElement.id === 'auth-modal') {
            grecaptcha.reset();
        }
        if (modalElement.id === 'terms-modal' && termsCountdownTimer) {
            clearInterval(termsCountdownTimer);
            termsCountdownDisplay.textContent = '';
            termsCountdownFinished = false; // Reset the flag
            updateStartChatButtonState(); // Update button state
        }
    }
}

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
    // Allows Vietnamese characters (including diacritics), English letters, numbers, and spaces.
    // Updated regex to include common Vietnamese diacritics
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
        userIpAddress = 'unknown'; // Fallback
    }
}

// --- Firebase Authentication and User Management ---

// Initial sign-in logic
async function initializeAuth() {
    if (isFirebaseInitialized) {
        console.log("Firebase already initialized. Skipping re-initialization.");
        return; // Prevent re-initialization
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
        isFirebaseInitialized = true; // Mark Firebase as initialized
        // onAuthStateChanged will be triggered by Firebase SDK automatically
    } catch (error) {
        console.error("Error during initial Firebase sign-in (initializeAuth):", error);
        showMessageBox(`Lỗi khởi tạo đăng nhập: ${error.code || error.message}. Vui lòng kiểm tra cấu hình Firebase Auth (đặc biệt là Anonymous Authentication).`);
        isFirebaseInitialized = true; // Still mark as initialized to avoid infinite loops, but with error
        // If initial sign-in fails, onAuthStateChanged will be called with null user.
        // We ensure UI state is updated by onAuthStateChanged.
    }
}

// Function to handle UI transitions based on auth state and user data
async function handleAuthStateAndUI(user) {
    currentUserId = user ? user.uid : null;
    console.log("onAuthStateChanged fired. User:", user ? user.uid : "null");
    console.log("Current currentUserId after onAuthStateChanged:", currentUserId); // Log currentUserId here

    if (!userIpAddress || userIpAddress === 'unknown') {
        await fetchUserIpAddress();
    }

    if (user) {
        currentUserIsAdmin = adminEmails.includes(user.email);
        if (currentUserIsAdmin) {
            cmdBtn.classList.remove('hidden');
            console.log("Admin user detected:", user.email);
        } else {
            cmdBtn.classList.add('hidden');
        }

        const userLoaded = await loadUserData(currentUserId, userIpAddress);

        if (userLoaded) {
            isUserSessionLoaded = true;
            console.log("User session fully loaded. Displaying chat interface.");
            startScreen.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            toggleModal(authModal, false);
            toggleModal(termsModal, false);
            updateUserProfileUI();
            loadUserGroups();
            loadMessages(activeGroupId);

            // Setup real-time listener for current user's profile to handle pause/unpause
            onSnapshot(doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, 'data'), (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    currentUser.isPaused = userData.isPaused; // Update local state
                    if (currentUser.isPaused) {
                        messageInput.disabled = true;
                        sendMessageBtn.disabled = true;
                        messageInput.placeholder = "Bạn đã bị khóa chat bởi Admin.";
                        createGroupBtn.disabled = true; // Pause new group creation
                        newGroupNameInput.disabled = true;
                        newGroupPasswordInput.disabled = true;
                        showMessageBox("Tài khoản của bạn đã bị tạm khóa chức năng chat bởi Admin.");
                    } else {
                        messageInput.disabled = false;
                        sendMessageBtn.disabled = false;
                        messageInput.placeholder = "Nhập tin nhắn của bạn (tối đa 1000 từ)";
                        createGroupBtn.disabled = false; // Enable new group creation
                        newGroupNameInput.disabled = false;
                        newGroupPasswordInput.disabled = false;
                    }
                } else {
                    // If user profile is deleted (e.g., banned), sign out and show ban message
                    console.log("User profile document does not exist. Initiating sign out and ban message.");
                    signOut(auth); // Explicitly sign out
                    showMessageBox("Tài khoản của bạn đã bị xóa hoặc cấm. Vui lòng tải lại trang.", false); // Non-dismissible
                    startScreen.classList.add('hidden'); // Ensure no other UI elements interfere
                    chatInterface.classList.add('hidden'); // Hide chat interface
                    toggleModal(authModal, false);
                    toggleModal(termsModal, false);
                    // Prevent any further interaction by returning
                    return;
                }
            }, (error) => {
                console.error("Error listening to user profile changes:", error);
                // Handle cases where listener itself fails (e.g., permissions)
                showMessageBox(`Lỗi theo dõi tài khoản: ${error.code || error.message}. Vui lòng tải lại trang.`, false);
            });

        } else {
            // User exists in Firebase auth, but data not loaded (e.g., new user, IP mismatch for non-admin)
            isUserSessionLoaded = false;
            console.log("User authenticated, but session data not loaded. Showing auth modal.");
            startScreen.classList.add('hidden');
            toggleModal(authModal, true);
            toggleModal(termsModal, false);
        }
    } else {
        // User is logged out or initial anonymous sign-in failed
        isUserSessionLoaded = false;
        console.log("User logged out or not authenticated. Showing auth modal.");
        startScreen.classList.add('hidden');
        toggleModal(authModal, true);
        toggleModal(termsModal, false);
        // If current user becomes null after being logged in (e.g., due to ban), show ban message
        // This check ensures it's not the initial load where user is legitimately null
        if (firebaseAuthChecked && currentUser !== null) { // This means a user *was* logged in and now isn't
             showMessageBox("Bạn đã bị đăng xuất khỏi hệ thống. Vui lòng tải lại trang nếu có lỗi.", false); // Non-dismissible if this happened unexpectedly
        }
    }
    firebaseAuthChecked = true; // Mark Firebase auth as checked
    // Re-evaluate startChatBtn state after auth check
    updateStartChatButtonState();
}

// Listen for Firebase Auth state changes
onAuthStateChanged(auth, handleAuthStateAndUI);

/**
 * Loads user data from Firestore based on UID or IP.
 * @param {string} uid - The Firebase User ID.
 * @param {string} ip - The user's IP address.
 * @returns {boolean} True if user data was loaded successfully, false otherwise.
 */
async function loadUserData(uid, ip) {
    const userDocRef = doc(db, `artifacts/${appId}/users/${uid}/profile`, 'data');
    try {
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.ipAddress === ip || currentUserIsAdmin) {
                currentUser = userData;
                currentUserName = currentUser.name;
                console.log("Existing user data loaded:", currentUser);
                return true;
            } else {
                console.warn("IP address mismatch for existing user. Treating as new session.");
                currentUser = null;
                return false;
            }
        } else {
            console.log("No existing user data found for UID:", uid);
            currentUser = null;
            return false;
        }
    } catch (error) {
        console.error("Error loading user data:", error);
        showMessageBox(`Lỗi khi tải dữ liệu người dùng: ${error.code || error.message}.`);
        currentUser = null;
        return false;
    }
}

/**
 * Registers a new user and saves their data to Firestore.
 * @param {string} name - The user's chosen name.
 */

async function registerUser(name) {
    if (!currentUserId) {
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
            id: currentUserId,
            ipAddress: userIpAddress,
            createdAt: serverTimestamp(),
            groups: ['default-group'],
            isAdmin: false,
            isPaused: false,
        };

        console.log("Attempting to set user profile document...");
        const userProfileDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, 'data');
        await setDoc(userProfileDocRef, newUserData);
        console.log("User profile saved successfully.");

        currentUser = newUserData;
        currentUserName = name;

        console.log("Attempting to update/create default group...");
        const defaultGroupRef = doc(db, `artifacts/${appId}/public/data/groups`, 'default-group');
        const defaultGroupSnap = await getDoc(defaultGroupRef);

        if (defaultGroupSnap.exists()) {
            const groupData = defaultGroupSnap.data();
            const currentMembers = groupData.members || [];
            if (!currentMembers.includes(currentUserId)) {
                await updateDoc(defaultGroupRef, {
                    members: [...currentMembers, currentUserId]
                });
                console.log("User added to default group members.");
            }
        } else {
            // SỬA LỖI: Xác định creatorId và creatorName dựa trên người dùng hiện tại
            const actualCreatorId = currentUserId; // Người tạo thực sự là người dùng hiện tại
            const actualCreatorName = name; // Tên người tạo là tên của người dùng hiện tại

            await setDoc(defaultGroupRef, {
                name: 'Dô la - ToanCreator',
                creatorId: actualCreatorId, // Sử dụng ID của người dùng đang tạo
                creatorName: actualCreatorName, // Sử dụng tên của người dùng đang tạo
                id: 'default-group',
                createdAt: serverTimestamp(),
                members: [currentUserId],
                isPublic: true,
                password: null,
            });
            console.log("Default group created and user added.");
        }
        console.log("Default group setup complete.");

        toggleModal(termsModal, false);
        startScreen.classList.add('hidden');
        chatInterface.classList.remove('hidden');

        updateUserProfileUI();
        loadUserGroups();
        await loadMessages(activeGroupId);

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
 * @param {object} message - The message object.
 */
function displayMessage(message) {
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble');

    let senderInfoHtml = '';
    let messageTextClass = 'message-text';
    let senderNameStyle = '';

    if (message.senderId === currentUserId) {
        messageBubble.classList.add('sent');
        senderInfoHtml = `
            <span class="sender-name">Bạn</span>
            <button class="copy-id-btn" data-id="${message.senderId}">Sao chép ID</button>
        `;
    } else if (message.senderId === 'admin') {
        messageBubble.classList.add('admin');
        senderInfoHtml = `<span class="admin-name">Toàn Creator ✅</span>`;
        messageTextClass += ' italic';
    } else if (message.type === 'system') {
        messageBubble.classList.add('system-message');
        messageBubble.textContent = message.text;
        chatMessages.appendChild(messageBubble);
        return;
    } else {
        messageBubble.classList.add('received');
        senderNameStyle = `style="color: ${getUserColor(message.senderId)};"`;
        senderInfoHtml = `
            <span class="sender-name" ${senderNameStyle}>${message.senderName}</span>
            <button class="copy-id-btn" data-id="${message.senderId}">Sao chép ID</button>
        `;
    }

    messageBubble.innerHTML = `
        <div class="message-content">
            <div class="sender-info">${senderInfoHtml}</div>
            <div class="${messageTextClass}" style="color: black;">${message.text}</div>
            <div class="timestamp">${formatTimestamp(message.timestamp)}</div>
        </div>
    `;
    chatMessages.appendChild(messageBubble);

    const copyIdBtn = messageBubble.querySelector('.copy-id-btn');
    if (copyIdBtn) {
        copyIdBtn.addEventListener('click', (e) => {
            const idToCopy = e.target.dataset.id;
            copyToClipboard(idToCopy);
            showMessageBox("Đã sao chép ID!");
        });
    }
}

/**
 * Copies text to the clipboard.
 * @param {string} text - The text to copy.
 */
function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textarea);
}

/**
 * Sends a chat message to the active group.
 */
async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === '' || !currentUser || !activeGroupId) {
        return;
    }

    if (!currentUserIsAdmin && currentUser.isPaused) {
        showMessageBox("Tài khoản của bạn đã bị tạm khóa chức năng chat bởi Admin.");
        return;
    }

    const newMessage = {
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: messageText,
        timestamp: serverTimestamp(),
        type: 'chat'
    };

    try {
        const messagesCollectionRef = collection(db, `artifacts/${appId}/public/data/groups/${activeGroupId}/messages`);
        await addDoc(messagesCollectionRef, newMessage);
        messageInput.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (e) {
        console.error("Error sending message: ", e);
        showMessageBox(`Lỗi khi gửi tin nhắn: ${e.code || e.message}. Vui lòng thử lại.`);
    }
}

/**
 * Sends a system message to a specific group.
 * @param {string} groupId - The ID of the group.
 * @param {string} message - The system message text.
 */
async function sendSystemMessage(groupId, message) {
    const systemMessage = {
        senderId: 'system',
        senderName: 'Hệ thống',
        text: message,
        timestamp: serverTimestamp(),
        type: 'system'
    };
    try {
        const messagesCollectionRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
        await addDoc(messagesCollectionRef, systemMessage);
    } catch (e) {
        console.error("Error sending system message: ", e);
        showMessageBox(`Lỗi khi gửi tin nhắn hệ thống: ${e.code || e.message}.`);
    }
}

// --- Event Listeners ---

chatNowBtn.addEventListener('click', async () => {
    console.log("Chat Now button clicked.");
    if (!firebaseAuthChecked) {
        showMessageBox("Hệ thống đang khởi tạo xác thực, vui lòng đợi giây lát.");
        console.log("Firebase auth not yet checked when Chat Now button clicked.");
        return;
    }

    if (isUserSessionLoaded) {
        console.log("User session already loaded. Showing chat interface.");
        startScreen.classList.add('hidden');
        chatInterface.classList.remove('hidden');
        toggleModal(authModal, false);
        toggleModal(termsModal, false);
    } else {
        console.log("User session not loaded. Showing auth modal.");
        startScreen.classList.add('hidden');
        toggleModal(authModal, true);
        toggleModal(termsModal, false);
    }
});

fullNameInput.addEventListener('input', () => {
    const isValid = isValidFullName(fullNameInput.value);
    setupBtn.disabled = !isValid;
    if (isValid) {
        setupBtn.classList.remove('disabled');
    } else {
        setupBtn.classList.add('disabled');
    }
});

setupBtn.addEventListener('click', () => {
    const fullName = fullNameInput.value.trim();
    const recaptchaResponse = grecaptcha.getResponse();

    if (!isValidFullName(fullName)) {
        showMessageBox("Họ và Tên không hợp lệ. Chỉ chấp nhận chữ, số, và ký tự tiếng Việt có dấu, tối đa 20 ký tự.");
        return;
    }

    if (!recaptchaResponse) {
        showMessageBox("Vui lòng xác minh bạn không phải là robot.");
        return;
    }

    console.log("reCAPTCHA response:", recaptchaResponse);

    toggleModal(authModal, false);
    toggleModal(termsModal, true);
    // Start countdown when terms modal is shown
    startTermsCountdown();
    // Update button state immediately after showing terms modal
    updateStartChatButtonState();

    // Reset reCAPTCHA after successful setup button click to force re-verification for next attempt
    if (typeof grecaptcha !== 'undefined') {
        grecaptcha.reset();
    }
});

// New function for terms countdown
function startTermsCountdown() {
    let timeLeft = 60;
    termsCountdownDisplay.textContent = `Vui lòng đợi ${timeLeft} giây...`;
    startChatBtn.disabled = true;
    startChatBtn.classList.add('disabled');
    termsCountdownFinished = false; // Reset the flag

    if (termsCountdownTimer) clearInterval(termsCountdownTimer); // Clear any existing timer
    termsCountdownTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(termsCountdownTimer);
            termsCountdownDisplay.textContent = 'Bạn có thể bắt đầu chat!';
            termsCountdownFinished = true; // Set the flag
            updateStartChatButtonState(); // Re-check state after countdown
        } else {
            termsCountdownDisplay.textContent = `Vui lòng đợi ${timeLeft} giây...`;
        }
    }, 1000);
}

agreeTermsCheckbox.addEventListener('change', () => {
    updateStartChatButtonState();
});

function updateStartChatButtonState() {
    // Log the values that determine the button state
    console.log("Updating Start Chat button state - Debugging:");
    console.log("  agreeTermsCheckbox.checked:", agreeTermsCheckbox.checked);
    console.log("  firebaseAuthChecked:", firebaseAuthChecked);
    console.log("  currentUserId:", currentUserId);
    console.log("  termsCountdownFinished:", termsCountdownFinished); // Use the new flag


    if (agreeTermsCheckbox.checked && firebaseAuthChecked && currentUserId && termsCountdownFinished) {
        startChatBtn.disabled = false;
        startChatBtn.classList.remove('disabled');
        console.log("Start Chat button ENABLED.");
    } else {
        startChatBtn.disabled = true;
        startChatBtn.classList.add('disabled');
        console.log("Start Chat button DISABLED.");
    }
}


startChatBtn.addEventListener('click', async () => {
    console.log("Start Chat button clicked.");
    if (!agreeTermsCheckbox.checked) {
        showMessageBox("Bạn phải đồng ý với các điều khoản để bắt đầu.");
        return;
    }
    if (startChatBtn.disabled) { // Double check if button is still disabled by countdown
        showMessageBox("Vui lòng đợi hết thời gian chờ trước khi bắt đầu.");
        return;
    }
    if (!currentUserId) {
        showMessageBox("Hệ thống đang chờ xác thực người dùng. Vui lòng đợi một lát rồi thử lại, hoặc tải lại trang.");
        console.warn("Attempted to register user, but currentUserId is null. Firebase auth might not be ready yet.");
        return;
    }

    const fullName = fullNameInput.value.trim();
    await registerUser(fullName);
});

googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        console.log("Attempting Google login...");
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Google Login User:", user.email);

        if (adminEmails.includes(user.email)) {
            currentUserIsAdmin = true;
            await loadUserData(user.uid, userIpAddress);
            if (!currentUser) {
                const newAdminData = {
                    name: user.displayName || "Admin",
                    id: user.uid,
                    ipAddress: userIpAddress,
                    createdAt: serverTimestamp(),
                    groups: ['default-group'],
                    isAdmin: true,
                    isPaused: false,
                };
                const adminProfileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
                await setDoc(adminProfileDocRef, newAdminData);
                currentUser = newAdminData;
                currentUserName = newAdminData.name;
                console.log("Admin profile created:", newAdminData);
            } else {
                if (!currentUser.isAdmin) {
                    const adminProfileDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
                    await updateDoc(adminProfileDocRef, { isAdmin: true });
                    currentUser.isAdmin = true;
                }
            }

            toggleModal(authModal, false);
            startScreen.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            updateUserProfileUI();
            loadUserGroups();
            loadMessages(activeGroupId);
            cmdBtn.classList.remove('hidden');
            showMessageBox("Đăng nhập Admin thành công!");
        } else {
            await signOut(auth);
            showMessageBox("Bạn không có quyền Admin để đăng nhập bằng Google.");
        }
    } catch (error) {
        console.error("Google login error:", error);
        showMessageBox(`Đăng nhập Google thất bại: ${error.code || error.message}. Vui lòng thử lại.`);
    }
});

sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

uploadImageBtn.addEventListener('click', () => {
    showMessageBox("Tính năng upload ảnh hiện chưa được hỗ trợ.");
});

themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('dark-theme', themeSwitch.checked);
    localStorage.setItem('theme', themeSwitch.checked ? 'dark' : 'light');
});

// Load saved theme preference and fetch IP on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    }
    initializeAuth();
});


// --- Group Management Modals and Functions ---

createJoinGroupBtn.addEventListener('click', () => {
    toggleModal(createJoinGroupModal, true);
    createGroupForm.classList.add('hidden');
    joinGroupForm.classList.add('hidden');
});

showCreateGroupFormBtn.addEventListener('click', () => {
    createGroupForm.classList.remove('hidden');
    joinGroupForm.classList.add('hidden');
});

showJoinGroupFormBtn.addEventListener('click', () => {
    joinGroupForm.classList.remove('hidden');
    createGroupForm.classList.add('hidden');
});

createGroupBtn.addEventListener('click', async () => {
    const groupName = newGroupNameInput.value.trim();
    const groupPassword = newGroupPasswordInput.value.trim();

    if (!groupName || groupName.length > 15) {
        showMessageBox("Tên nhóm không hợp lệ (tối đa 15 ký tự).");
        return;
    }
    if (!groupPassword || groupPassword.length > 8) {
        showMessageBox("Mật khẩu nhóm không hợp lệ (tối đa 8 ký tự).");
        return;
    }
    if (!currentUser) {
        showMessageBox("Vui lòng đăng kí tài khoản trước.");
        return;
    }
    if (!currentUserIsAdmin && currentUser.isPaused) { // Check for pause status
        showMessageBox("Tài khoản của bạn đã bị tạm khóa chức năng tạo nhóm bởi Admin.");
        return;
    }

    const newGroupId = generateUniqueId();
    const groupData = {
        name: groupName,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        id: newGroupId,
        createdAt: serverTimestamp(),
        members: [currentUser.id],
        isPublic: false,
        password: groupPassword,
    };

    try {
        const groupDocRef = doc(db, `artifacts/${appId}/public/data/groups`, newGroupId);
        await setDoc(groupDocRef, groupData);

        const userProfileDocRef = doc(db, `artifacts/${appId}/users/${currentUser.id}/profile`, 'data');
        await updateDoc(userProfileDocRef, {
            groups: [...(currentUser.groups || []), newGroupId]
        });
        currentUser.groups = [...(currentUser.groups || []), newGroupId];

        showMessageBox("Nhóm đã được tạo thành công!");
        toggleModal(createJoinGroupModal, false);
        newGroupNameInput.value = '';
        newGroupPasswordInput.value = '';
        switchGroup(newGroupId, groupName);

        await sendSystemMessage(newGroupId, `${currentUser.name} đã tạo nhóm "${groupName}".`);

    } catch (e) {
        console.error("Error creating group: ", e);
        showMessageBox(`Đã xảy ra lỗi khi tạo nhóm: ${e.code || e.message}. Vui lòng thử lại.`);
    }
});

joinGroupBtn.addEventListener('click', async () => {
    const groupIdToJoin = joinGroupIdInput.value.trim();

    if (!groupIdToJoin) {
        showMessageBox("Vui lòng nhập ID nhóm.");
        return;
    }
    if (!currentUser) {
        showMessageBox("Vui lòng đăng kí tài khoản trước.");
        return;
    }

    try {
        const groupDocRef = doc(db, `artifacts/${appId}/public/data/groups`, groupIdToJoin);
        const groupSnap = await getDoc(groupDocRef);

        if (groupSnap.exists()) {
            const groupData = groupSnap.data();
            const currentMembers = groupData.members || [];

            if (currentMembers.includes(currentUser.id)) {
                showMessageBox("Bạn đã là thành viên của nhóm này rồi.");
                switchGroup(groupIdToJoin, groupData.name);
                toggleModal(createJoinGroupModal, false);
                return;
            }

            await updateDoc(groupDocRef, {
                members: [...currentMembers, currentUser.id]
            });

            const userProfileDocRef = doc(db, `artifacts/${appId}/users/${currentUser.id}/profile`, 'data');
            await updateDoc(userProfileDocRef, {
                groups: [...(currentUser.groups || []), groupIdToJoin]
            });
            currentUser.groups = [...(currentUser.groups || []), groupIdToJoin];

            showMessageBox(`Đã tham gia nhóm "${groupData.name}" thành công!`);
            toggleModal(createJoinGroupModal, false);
            joinGroupIdInput.value = '';
            switchGroup(groupIdToJoin, groupData.name);

            await sendSystemMessage(groupIdToJoin, `${currentUser.name} vừa tham gia nhóm.`);

        } else {
            showMessageBox("ID nhóm không tồn tại.");
        }
    } catch (e) {
        console.error("Error joining group: ", e);
        showMessageBox(`Đã xảy ra lỗi khi tham gia nhóm: ${e.code || e.message}. Vui lòng thử lại.`);
    }
});

groupInfoBtn.addEventListener('click', async () => {
    if (!activeGroupId || !activeGroupData) {
        showMessageBox("Vui lòng chọn một nhóm để xem thông tin.");
        return;
    }

    const groupDocRef = doc(db, `artifacts/${appId}/public/data/groups`, activeGroupId);
    try {
        const groupSnap = await getDoc(groupDocRef);
        if (groupSnap.exists()) {
            activeGroupData = groupSnap.data();
            infoGroupName.textContent = activeGroupData.name;
            infoGroupCreator.textContent = activeGroupData.creatorName;
            infoGroupId.textContent = activeGroupData.id;
            infoGroupCreationDate.textContent = formatTimestamp(activeGroupData.createdAt);
            infoMemberCount.textContent = (activeGroupData.members ? activeGroupData.members.length : 0);
            toggleModal(groupInfoModal, true);
        } else {
            activeGroupData = null;
            console.warn("Active group data not found for:", activeGroupId);
            showMessageBox("Không tìm thấy thông tin nhóm.");
        }
    } catch (error) {
        console.error("Error fetching group info:", error);
        showMessageBox(`Lỗi khi tải thông tin nhóm: ${error.code || error.message}.`);
    }
});

inviteUserBtn.addEventListener('click', () => {
    if (!activeGroupId) {
        showMessageBox("Vui lòng chọn một nhóm để mời thành viên.");
        return;
    }
    toggleModal(inviteUserModal, true);
});

sendInviteBtn.addEventListener('click', async () => {
    const inviteUserId = inviteUserIdInput.value.trim();
    if (!inviteUserId) {
        showMessageBox("Vui lòng nhập ID người dùng để mời.");
        return;
    }
    if (!activeGroupId || !activeGroupData) {
        showMessageBox("Không có nhóm nào đang hoạt động để gửi lời mời.");
        return;
    }

    try {
        const invitedUserProfileRef = doc(db, `artifacts/${appId}/users/${inviteUserId}/profile`, 'data');
        const invitedUserSnap = await getDoc(invitedUserProfileRef);

        if (!invitedUserSnap.exists()) {
            showMessageBox("ID người dùng không tồn tại.");
            return;
        }

        const invitedUserData = invitedUserSnap.data();
        const invitedUserGroups = invitedUserData.groups || [];

        if (invitedUserGroups.includes(activeGroupId)) {
            showMessageBox("Người dùng này đã là thành viên của nhóm.");
            return;
        }

        await updateDoc(invitedUserProfileRef, {
            groups: [...invitedUserGroups, activeGroupId]
        });

        const currentGroupMembers = activeGroupData.members || [];
        if (!currentGroupMembers.includes(inviteUserId)) {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/groups`, activeGroupId), {
                members: [...currentGroupMembers, inviteUserId]
            });
            activeGroupData.members.push(inviteUserId);
        }

        showMessageBox(`Đã gửi lời mời đến ${invitedUserData.name} thành công!`);
        toggleModal(inviteUserModal, false);
        inviteUserIdInput.value = '';

        await sendSystemMessage(activeGroupId, `${currentUser.name} đã mời ${invitedUserData.name} vào nhóm.`);

    } catch (e) {
        console.error("Error sending invite: ", e);
        showMessageBox(`Đã xảy ra lỗi khi gửi lời mời: ${e.code || e.message}. Vui lòng thử lại.`);
    }
});

deleteGroupBtn.addEventListener('click', () => {
    if (!activeGroupId || activeGroupId === 'default-group') {
        showMessageBox("Không thể xóa nhóm chính hoặc không có nhóm nào đang hoạt động.");
        return;
    }
    if (!activeGroupData || (activeGroupData.creatorId !== currentUser.id && !currentUserIsAdmin)) {
        showMessageBox("Bạn không có quyền xóa nhóm này.");
        return;
    }
    toggleModal(deleteGroupModal, true);
});

confirmDeleteGroupBtn.addEventListener('click', async () => {
    const password = deleteGroupPasswordInput.value.trim();
    if (!activeGroupData) {
        showMessageBox("Không tìm thấy thông tin nhóm.");
        return;
    }

    if (password !== activeGroupData.password && !currentUserIsAdmin) {
        showMessageBox("Mật khẩu nhóm không đúng.");
        return;
    }

    try {
        const batch = writeBatch(db); // Use writeBatch(db)

        // Delete all messages in the group
        const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${activeGroupId}/messages`);
        const q = query(messagesRef);
        const snapshot = await getDocs(q);
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Remove group from all members' profiles
        const members = activeGroupData.members || [];
        for (const memberId of members) {
            const memberProfileRef = doc(db, `artifacts/${appId}/users/${memberId}/profile`, 'data');
            const memberSnap = await getDoc(memberProfileRef);
            if (memberSnap.exists()) {
                const memberData = memberSnap.data();
                const updatedGroups = (memberData.groups || []).filter(g => g !== activeGroupId);
                batch.update(memberProfileRef, { groups: updatedGroups });
            }
        }

        // Delete the group document itself
        const groupDocRef = doc(db, `artifacts/${appId}/public/data/groups`, activeGroupId);
        batch.delete(groupDocRef);

        await batch.commit(); // Commit all batched operations

        showMessageBox(`Nhóm "${activeGroupData.name}" đã được xóa thành công!`);
        toggleModal(deleteGroupModal, false);
        deleteGroupPasswordInput.value = '';

        switchGroup('default-group', 'Dô la - ToanCreator');

    } catch (e) {
        console.error("Error deleting group: ", e);
        showMessageBox(`Đã xảy ra lỗi khi xóa nhóm: ${e.code || e.message}. Vui lòng thử lại.`);
    }
});


// --- Admin CMD Functions ---

const cmdCommands = [
    ':pause', ':unpause', ':clear', ':showgroup', ':showpeople',
    ':allpause', ':unallpause', ':allclear', ':ban'
];

function generateCmdKeyboard() {
    cmdKeyboard.innerHTML = '';
    cmdCommands.forEach(cmd => {
        const button = document.createElement('button');
        button.textContent = cmd;
        button.addEventListener('click', () => {
            cmdInput.value = cmd + ' ';
            cmdInput.focus();
        });
        cmdKeyboard.appendChild(button);
    });
}

cmdBtn.addEventListener('click', () => {
    if (!currentUserIsAdmin) {
        showMessageBox("Bạn không có quyền truy cập CMD.");
        return;
    }
    toggleModal(adminCmdModal, true);
    cmdOutput.textContent = "Chào mừng đến với Admin CMD. Nhập lệnh để thực thi.";
    generateCmdKeyboard();
    // Apply scrolling style for cmdOutput
    cmdOutput.style.maxHeight = '300px'; // Set a max-height
    cmdOutput.style.overflowY = 'auto';  // Enable vertical scrolling
    cmdOutput.style.whiteSpace = 'pre-wrap'; // Preserve whitespace and wrap text
});

executeCmdBtn.addEventListener('click', executeAdminCommand);
cmdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        executeAdminCommand();
    }
});

async function executeAdminCommand() {
    const command = cmdInput.value.trim();
    cmdInput.value = '';
    cmdOutput.textContent += `\n> ${command}\n`;

    const parts = command.split(/\s+/);
    const cmd = parts[0];
    const targetId = parts[1];

    try {
        switch (cmd) {
            case ':pause':
                if (targetId) await toggleUserPause(targetId, true);
                else cmdOutput.textContent += "Lỗi: Cần ID người dùng. Cú pháp: :pause <id người dùng>\n";
                break;
            case ':unpause':
                if (targetId) await toggleUserPause(targetId, false);
                else cmdOutput.textContent += "Lỗi: Cần ID người dùng. Cú pháp: :unpause <id người dùng>\n";
                break;
            case ':clear':
                if (targetId) await clearMessages(targetId);
                else cmdOutput.textContent += "Lỗi: Cần ID người dùng hoặc ID nhóm. Cú pháp: :clear <id người dùng/nhóm>\n";
                break;
            case ':showgroup':
                await showGroups();
                break;
            case ':showpeople':
                await showPeople();
                break;
            case ':allpause':
                await toggleAllPause(true);
                break;
            case ':unallpause':
                await toggleAllPause(false);
                break;
            case ':allclear':
                await clearAllMessages();
                break;
            case ':ban':
                if (targetId) await banUser(targetId);
                else cmdOutput.textContent += "Lỗi: Cần ID người dùng. Cú pháp: :ban <id người dùng>\n";
                break;
            default:
                cmdOutput.textContent += "Lệnh không hợp lệ.\n";
        }
    } catch (e) {
        console.error("CMD execution error:", e);
        cmdOutput.textContent += `Lỗi thực thi lệnh: ${e.code || e.message || e}\n`;
    }
    cmdOutput.scrollTop = cmdOutput.scrollHeight;
}

async function toggleUserPause(userId, pause) {
    const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
    try {
        const userSnap = await getDoc(userProfileRef);
        if (!userSnap.exists()) {
            cmdOutput.textContent += `Lỗi: Người dùng với ID ${userId} không tồn tại.\n`;
            return;
        }
        await updateDoc(userProfileRef, { isPaused: pause });
        cmdOutput.textContent += `Người dùng ${userId} đã ${pause ? 'bị khóa' : 'được mở khóa'} chat.\n`;
        // Send a system message to all groups the user is in
        const userData = userSnap.data();
        if (userData.groups && userData.groups.length > 0) {
            for (const groupId of userData.groups) {
                await sendSystemMessage(groupId, `Admin đã ${pause ? 'khóa' : 'mở khóa'} chat của người dùng ${userData.name} (ID: ${userId}).`);
            }
        }
    } catch (e) {
        cmdOutput.textContent += `Lỗi khi ${pause ? 'khóa' : 'mở khóa'} người dùng ${userId}: ${e.code || e.message}\n`;
    }
}

async function clearMessages(targetId) {
    try {
        const batch = writeBatch(db); // Use writeBatch(db)
        const groupRef = doc(db, `artifacts/${appId}/public/data/groups`, targetId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
            // Target is a group ID
            const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${targetId}/messages`);
            const q = query(messagesRef);
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            cmdOutput.textContent += `Đã xóa tất cả tin nhắn trong nhóm ${targetId}.\n`;
            await sendSystemMessage(targetId, `Admin đã xóa tất cả tin nhắn trong nhóm này.`);
        } else {
            // Target is likely a user ID, clear messages by this user across all groups
            const groupsCollectionRef = collection(db, `artifacts/${appId}/public/data/groups`);
            const groupsSnapshot = await getDocs(groupsCollectionRef); // Ensure await here

            for (const groupDoc of groupsSnapshot.docs) {
                const groupId = groupDoc.id;
                const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
                const q = query(messagesRef, where('senderId', '==', targetId));
                const snapshot = await getDocs(q);
                snapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });
            }
            await batch.commit(); // Commit batch for all user messages
            cmdOutput.textContent += `Đã xóa tất cả tin nhắn của người dùng ${targetId} trên tất cả các nhóm.\n`;
            // Sending system message to the active group, as a general notification
            await sendSystemMessage(activeGroupId, `Admin đã xóa tất cả tin nhắn của người dùng ${targetId}.`);
        }
    } catch (e) {
        cmdOutput.textContent += `Lỗi khi xóa tin nhắn: ${e.code || e.message}\n`;
    }
}

async function showGroups() {
    try {
        const groupsCollectionRef = collection(db, `artifacts/${appId}/public/data/groups`);
        const q = query(groupsCollectionRef);
        const snapshot = await getDocs(q);
        cmdOutput.textContent += "Danh sách các nhóm:\n";
        snapshot.forEach(doc => {
            const data = doc.data();
            cmdOutput.textContent += `- Tên: ${data.name}, ID: ${data.id}, Mật khẩu: ${data.password || 'Không có'}, Người tạo: ${data.creatorName || 'Không rõ'}\n`;
        });
    } catch (e) {
        cmdOutput.textContent += `Lỗi khi hiển thị nhóm: ${e.code || e.message}\n`;
    }
}

async function showPeople() {
    try {
        const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
        const snapshot = await getDocs(usersCollectionRef); // This will get the user ID documents
        cmdOutput.textContent += "Danh sách các tài khoản:\n";
        if (snapshot.empty) {
            cmdOutput.textContent += "Không tìm thấy người dùng nào trong hệ thống.\n";
            return;
        }
        for (const userDoc of snapshot.docs) {
            const userId = userDoc.id;
            const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
            const profileSnap = await getDoc(profileDocRef);
            if (profileSnap.exists()) {
                const data = profileSnap.data();
                cmdOutput.textContent += `- Tên: ${data.name}, ID: ${data.id}, Admin: ${data.isAdmin ? 'Có' : 'Không'}, IP: ${data.ipAddress}, Tạm khóa: ${data.isPaused ? 'Có' : 'Không'}\n`;
            } else {
                cmdOutput.textContent += `- Cảnh báo: Hồ sơ người dùng ID: ${userId} không tìm thấy (profile/data).\n`;
            }
        }
    } catch (e) {
        cmdOutput.textContent += `Lỗi khi hiển thị người dùng: ${e.code || e.message}\n`;
    }
}

async function toggleAllPause(pause) {
    try {
        const batch = writeBatch(db);
        const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
        const snapshot = await getDocs(usersCollectionRef);

        if (snapshot.empty) {
            cmdOutput.textContent += "Không tìm thấy người dùng nào để tạm dừng/bỏ tạm dừng.\n";
            return;
        }

        for (const userDoc of snapshot.docs) {
            const userId = userDoc.id;
            const profileDocRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
            const profileSnap = await getDoc(profileDocRef); // Get the actual profile data
            if (profileSnap.exists()) {
                const userData = profileSnap.data();
                // Only pause non-admin users
                if (!userData.isAdmin) {
                    batch.update(profileDocRef, { isPaused: pause });
                }
            }
        }
        await batch.commit();
        cmdOutput.textContent += `Đã ${pause ? 'khóa' : 'mở khóa'} chat cho tất cả người dùng (trừ admin).\n`;
        // Send system message to default group
        await sendSystemMessage('default-group', `Admin đã ${pause ? 'khóa' : 'mở khóa'} chat cho tất cả người dùng.`);
    } catch (e) {
        cmdOutput.textContent += `Lỗi khi ${pause ? 'khóa' : 'mở khóa'} tất cả người dùng: ${e.code || e.message}\n`;
    }
}

async function clearAllMessages() {
    try {
        const batch = writeBatch(db); // Use writeBatch(db)
        const groupsCollectionRef = collection(db, `artifacts/${appId}/public/data/groups`);
        const groupsSnapshot = await getDocs(groupsCollectionRef);

        for (const groupDoc of groupsSnapshot.docs) {
            const groupId = groupDoc.id;
            const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
            const q = query(messagesRef);
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
        }
        await batch.commit(); // Commit all batched operations
        cmdOutput.textContent += "Đã xóa tất cả tin nhắn trên tất cả các nhóm.\n";
        // Send system message to default group
        await sendSystemMessage('default-group', `Admin đã xóa tất cả tin nhắn trên toàn bộ hệ thống.`);
    } catch (e) {
        cmdOutput.textContent += `Lỗi khi xóa tất cả tin nhắn: ${e.code || e.message}\n`;
    }
}

async function banUser(userId) {
    if (userId === currentUser.id) {
        cmdOutput.textContent += "Lỗi: Không thể tự cấm tài khoản của mình.\n";
        return;
    }

    try {
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
        const userSnap = await getDoc(userProfileRef);
        if (!userSnap.exists()) {
            cmdOutput.textContent += `Lỗi: Người dùng với ID ${userId} không tồn tại.\n`;
            return;
        }
        const userData = userSnap.data();

        const batch = writeBatch(db);

        // 1. Delete groups created by this user (except default-group)
        const groupsCreatedByUserQuery = query(
            collection(db, `artifacts/${appId}/public/data/groups`),
            where('creatorId', '==', userId)
        );
        const createdGroupsSnapshot = await getDocs(groupsCreatedByUserQuery);

        if (!createdGroupsSnapshot.empty) {
            cmdOutput.textContent += `Đang xóa các nhóm do người dùng ${userId} tạo...\n`;
        }

        for (const groupDoc of createdGroupsSnapshot.docs) {
            if (groupDoc.id !== 'default-group') {
                const groupIdToDelete = groupDoc.id;
                const groupData = groupDoc.data();

                // Delete all messages in this group
                const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${groupIdToDelete}/messages`);
                const messagesSnapshot = await getDocs(query(messagesRef));
                messagesSnapshot.forEach(msgDoc => batch.delete(msgDoc.ref));

                // Remove this group from all its members' profiles
                const membersInGroup = groupData.members || [];
                for (const memberId of membersInGroup) {
                    const memberProfileRef = doc(db, `artifacts/${appId}/users/${memberId}/profile`, 'data');
                    const memberSnap = await getDoc(memberProfileRef);
                    if (memberSnap.exists()) {
                        const memberData = memberSnap.data();
                        const updatedGroups = (memberData.groups || []).filter(g => g !== groupIdToDelete);
                        batch.update(memberProfileRef, { groups: updatedGroups });
                    }
                }
                // Delete the group document itself
                batch.delete(doc(db, `artifacts/${appId}/public/data/groups`, groupIdToDelete));
                cmdOutput.textContent += `- Đã xóa nhóm "${groupData.name}" (ID: ${groupIdToDelete}) được tạo bởi ${userId}.\n`;
            }
        }

        // 2. Remove user from all other groups they are a member of
        cmdOutput.textContent += `Đang xóa người dùng ${userId} khỏi các nhóm khác...\n`;
        const allGroupsRef = collection(db, `artifacts/${appId}/public/data/groups`);
        const allGroupsSnapshot = await getDocs(allGroupsRef);

        for (const groupDoc of allGroupsSnapshot.docs) {
            const groupRef = doc(db, `artifacts/${appId}/public/data/groups`, groupDoc.id);
            const groupData = groupDoc.data();
            const updatedMembers = (groupData.members || []).filter(member => member !== userId);
            // Only update if the user was actually a member and is being removed
            if (updatedMembers.length < (groupData.members || []).length) {
                batch.update(groupRef, { members: updatedMembers });
                cmdOutput.textContent += `- Đã xóa ${userId} khỏi nhóm "${groupData.name}" (ID: ${groupDoc.id}).\n`;
            }
        }

        // 3. Delete all messages sent by this user across all groups
        cmdOutput.textContent += `Đang xóa tin nhắn của người dùng ${userId}...\n`;
        const messagesToDelete = [];
        for (const groupDoc of allGroupsSnapshot.docs) { // Re-iterate all groups for messages
            const groupId = groupDoc.id;
            const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
            const q = query(messagesRef, where('senderId', '==', userId));
            const snapshot = await getDocs(q);
            snapshot.forEach((msgDoc) => {
                messagesToDelete.push(msgDoc.ref);
            });
        }
        messagesToDelete.forEach(msgRef => batch.delete(msgRef));
        if (messagesToDelete.length > 0) {
            cmdOutput.textContent += `- Đã xóa ${messagesToDelete.length} tin nhắn của người dùng ${userId}.\n`;
        } else {
            cmdOutput.textContent += `- Không tìm thấy tin nhắn nào của người dùng ${userId} để xóa.\n`;
        }


        // 4. Delete the user's profile document
        cmdOutput.textContent += `Đang xóa hồ sơ người dùng ${userId}...\n`;
        batch.delete(userProfileRef);

        await batch.commit();

        // Send a system message to all groups the user was in
        if (userData.groups && userData.groups.length > 0) {
            for (const groupId of userData.groups) {
                await sendSystemMessage(groupId, `Admin đã cấm và xóa người dùng ${userData.name} (ID: ${userId}) khỏi hệ thống.`);
            }
        }
        // This message box is for the admin who executed the command
        showMessageBox(`Người dùng ${userData.name} (ID: ${userId}) đã bị cấm và xóa khỏi hệ thống.`, true); // Now dismissible for admin
        cmdOutput.textContent += `Người dùng ${userData.name} (ID: ${userId}) đã bị cấm và xóa khỏi hệ thống.\n`;

        // The banned user's client will handle showing the non-dismissible message via the onSnapshot listener on their profile doc.

    } catch (e) {
        console.error("Error banning user:", e);
        showMessageBox(`Đã xảy ra lỗi khi cấm người dùng ${userId}: ${e.code || e.message}. Vui lòng thử lại.`);
        cmdOutput.textContent += `Lỗi khi cấm người dùng ${userId}: ${e.code || e.message}\n`;
    }
}