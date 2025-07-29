// Ensure Firebase variables are available globally from index.html script
const db = window.db;
const auth = window.auth;
const GoogleAuthProvider = window.GoogleAuthProvider;
const signInWithPopup = window.signInWithPopup;
const signOut = window.signOut;
const onAuthStateChanged = window.onAuthStateChanged;
const doc = window.doc;
const getDoc = window.getDoc;
const setDoc = window.setDoc;
const updateDoc = window.updateDoc;
const deleteDoc = window.deleteDoc;
const onSnapshot = window.onSnapshot;
const collection = window.collection;
const query = window.query;
const where = window.where;
const addDoc = window.addDoc;
const getDocs = window.getDocs;
const serverTimestamp = window.serverTimestamp;
const appId = window.appId;
const initialAuthToken = window.initialAuthToken;

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
let userIpAddress = 'unknown'; // Placeholder for IP address
let activeGroupId = 'default-group'; // Default group ID
let activeGroupData = null; // Stores data for the currently active group
let firebaseInitialized = false; // Flag to ensure Firebase is ready

const adminEmails = ['tranhoangtoan2k8@gmail.com', 'lehuutam20122008@gmail.com'];

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
        // Reset reCAPTCHA when modal is closed
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
 * Formats a timestamp into a readable date and time string.
 * @param {firebase.firestore.Timestamp|Date} timestamp - The timestamp to format.
 * @returns {string} Formatted date and time.
 */
function formatTimestamp(timestamp) {
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('vi-VN', options);
}

/**
 * Validates full name input (alphanumeric only, max 20 chars).
 * @param {string} name - The name to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidFullName(name) {
    return /^[a-zA-Z0-9\s]{1,20}$/.test(name);
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

// Listen for Firebase Auth state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        console.log("Firebase Auth State Changed: User Logged In", currentUserId);

        // Check if user is admin
        currentUserIsAdmin = adminEmails.includes(user.email);
        if (currentUserIsAdmin) {
            cmdBtn.classList.remove('hidden');
            console.log("Admin user detected:", user.email);
        } else {
            cmdBtn.classList.add('hidden');
        }

        // Fetch user data from Firestore
        await fetchUserIpAddress(); // Get IP before checking user data
        await loadUserData(currentUserId, userIpAddress);

        // If user data is loaded, proceed to chat interface
        if (currentUser) {
            startScreen.classList.add('hidden');
            chatInterface.classList.remove('hidden');
            updateUserProfileUI();
            loadUserGroups();
            loadMessages(activeGroupId); // Load messages for the default group
        } else {
            // New user or IP mismatch, show registration modal
            toggleModal(authModal, true);
        }
    } else {
        // User is signed out or not yet signed in
        console.log("Firebase Auth State Changed: User Logged Out");
        // Only show start screen if not already signed in anonymously by default
        if (!initialAuthToken) { // If no initial token, allow anonymous sign-in flow
             startScreen.classList.remove('hidden');
             chatInterface.classList.add('hidden');
        }
    }
    firebaseInitialized = true; // Mark Firebase as initialized
});

/**
 * Loads user data from Firestore based on UID or IP.
 * @param {string} uid - The Firebase User ID.
 * @param {string} ip - The user's IP address.
 */
async function loadUserData(uid, ip) {
    const userDocRef = doc(db, `artifacts/${appId}/users/${uid}/profile`, 'data');
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        // Check if IP matches (for basic short-term IP-based account persistence)
        if (userData.ipAddress === ip || currentUserIsAdmin) { // Admins bypass IP check
            currentUser = userData;
            currentUserName = currentUser.name;
            console.log("Existing user data loaded:", currentUser);
            return true;
        } else {
            console.warn("IP address mismatch for existing user. Treating as new session.");
            // If IP doesn't match, treat as new session for non-admin users
            // This means they won't automatically log in with their old profile
            // and will be prompted to register again.
            currentUser = null;
            return false;
        }
    } else {
        console.log("No existing user data found for UID:", uid);
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
        showMessageBox("Lỗi: Không tìm thấy ID người dùng.");
        return;
    }

    // Check if an account already exists for this IP
    const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
    const q = query(usersCollectionRef, where('profile.data.ipAddress', '==', userIpAddress));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty && !currentUserIsAdmin) {
        showMessageBox("Địa chỉ IP này đã được sử dụng để đăng kí tài khoản khác. Vui lòng sử dụng tài khoản đã đăng kí hoặc liên hệ admin.");
        return;
    }

    const newUserData = {
        name: name,
        id: currentUserId, // Use Firebase UID as user ID
        ipAddress: userIpAddress,
        createdAt: serverTimestamp(),
        groups: ['default-group'], // Automatically join default group
        isAdmin: false,
        isPaused: false, // For admin commands
    };

    try {
        // Store user profile data
        const userProfileDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, 'data');
        await setDoc(userProfileDocRef, newUserData);
        currentUser = newUserData;
        currentUserName = name;
        console.log("User registered successfully:", newUserData);

        // Add user to the default group's members list
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
            // Create default group if it doesn't exist
            await setDoc(defaultGroupRef, {
                name: 'Dô la - ToanCreator',
                creatorId: 'admin', // Placeholder admin ID
                creatorName: 'Toàn Creator ✅',
                id: 'default-group',
                createdAt: serverTimestamp(),
                members: [currentUserId],
                isPublic: true,
                password: null, // No password for default group
            });
            console.log("Default group created and user added.");
        }

        toggleModal(termsModal, false);
        startScreen.classList.add('hidden');
        chatInterface.classList.remove('hidden');
        updateUserProfileUI();
        loadUserGroups();
        loadMessages(activeGroupId);

        // Send system message about new user joining
        await sendSystemMessage(activeGroupId, `${name} vừa tham gia nhóm.`);

    } catch (e) {
        console.error("Error registering user: ", e);
        showMessageBox("Đã xảy ra lỗi khi đăng kí. Vui lòng thử lại.");
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
            contactList.querySelectorAll('.group-item:not(.create-join-group)').forEach(el => el.remove()); // Clear existing groups except default and create/join button

            // Add default group if not present (should always be there)
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
                            groupNameDisplay.textContent = groupData.name; // Update header
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
        console.error("Error loading user groups:", error);
    });
}

/**
 * Switches the active chat group.
 * @param {string} groupId - The ID of the group to switch to.
 * @param {string} groupName - The name of the group.
 */
async function switchGroup(groupId, groupName) {
    if (activeGroupId === groupId) return;

    // Remove active class from current group
    const currentActive = document.querySelector(`.group-item.active`);
    if (currentActive) {
        currentActive.classList.remove('active');
    }

    // Add active class to new group
    const newActive = document.querySelector(`.group-item[data-group-id="${groupId}"]`);
    if (newActive) {
        newActive.classList.add('active');
    }

    activeGroupId = groupId;
    groupNameDisplay.textContent = groupName;
    chatMessages.innerHTML = ''; // Clear existing messages
    await loadMessages(groupId); // Load messages for the new group

    // Fetch and store active group data for modal info
    const groupDocRef = doc(db, `artifacts/${appId}/public/data/groups`, groupId);
    const groupSnap = await getDoc(groupDocRef);
    if (groupSnap.exists()) {
        activeGroupData = groupSnap.data();
    } else {
        activeGroupData = null;
        console.warn("Active group data not found for:", groupId);
    }
}

/**
 * Loads messages for a given group and sets up a real-time listener.
 * @param {string} groupId - The ID of the group to load messages for.
 */
function loadMessages(groupId) {
    if (!db) {
        console.error("Firestore DB not initialized.");
        return;
    }

    const messagesCollectionRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
    const q = query(messagesCollectionRef); // No orderBy to avoid index issues

    onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = ''; // Clear messages before re-rendering
        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        // Sort messages by timestamp client-side
        messages.sort((a, b) => (a.timestamp && b.timestamp) ? a.timestamp.toDate() - b.timestamp.toDate() : 0);

        messages.forEach(msg => {
            displayMessage(msg);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }, (error) => {
        console.error("Error loading messages: ", error);
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

    if (message.senderId === currentUserId) {
        messageBubble.classList.add('sent');
        senderInfoHtml = `
            <span class="sender-name">Bạn</span>
            <button class="copy-id-btn" data-id="${message.senderId}">Sao chép ID</button>
        `;
    } else if (message.senderId === 'admin') {
        messageBubble.classList.add('admin');
        senderInfoHtml = `<span class="admin-name">Toàn Creator ✅</span>`;
        messageTextClass += ' italic'; // Italicize admin messages
    } else if (message.type === 'system') {
        messageBubble.classList.add('system-message');
        messageBubble.textContent = message.text;
        chatMessages.appendChild(messageBubble);
        return; // System messages are simpler
    } else {
        messageBubble.classList.add('received');
        senderInfoHtml = `
            <span class="sender-name">${message.senderName}</span>
            <button class="copy-id-btn" data-id="${message.senderId}">Sao chép ID</button>
        `;
    }

    messageBubble.innerHTML = `
        <div class="message-content">
            <div class="sender-info">${senderInfoHtml}</div>
            <div class="${messageTextClass}">${message.text}</div>
            <div class="timestamp">${formatTimestamp(message.timestamp)}</div>
        </div>
    `;
    chatMessages.appendChild(messageBubble);

    // Add event listener for copy ID button
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

    // Check if user is paused (only if not admin)
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
        messageInput.value = ''; // Clear input
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    } catch (e) {
        console.error("Error sending message: ", e);
        showMessageBox("Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.");
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
    }
}

// --- Event Listeners ---

chatNowBtn.addEventListener('click', async () => {
    if (!firebaseInitialized) {
        showMessageBox("Hệ thống đang khởi tạo, vui lòng đợi giây lát.");
        return;
    }
    // If user is already loaded (from IP check or previous session), go straight to chat
    if (currentUser) {
        startScreen.classList.add('hidden');
        chatInterface.classList.remove('hidden');
        updateUserProfileUI();
        loadUserGroups();
        loadMessages(activeGroupId);
    } else {
        // Otherwise, show registration modal
        toggleModal(authModal, true);
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
        showMessageBox("Họ và Tên không hợp lệ. Chỉ chấp nhận chữ và số, tối đa 20 ký tự.");
        return;
    }

    if (!recaptchaResponse) {
        showMessageBox("Vui lòng xác minh bạn không phải là robot.");
        return;
    }

    // In a real application, you'd send recaptchaResponse to your server for verification.
    // For this client-side demo, we'll just proceed if a response is present.
    console.log("reCAPTCHA response:", recaptchaResponse);

    toggleModal(authModal, false);
    toggleModal(termsModal, true);
});

agreeTermsCheckbox.addEventListener('change', () => {
    if (agreeTermsCheckbox.checked) {
        startChatBtn.disabled = false;
        startChatBtn.classList.remove('disabled');
    } else {
        startChatBtn.disabled = true;
        startChatBtn.classList.add('disabled');
    }
});

startChatBtn.addEventListener('click', async () => {
    if (!agreeTermsCheckbox.checked) {
        showMessageBox("Bạn phải đồng ý với các điều khoản để bắt đầu.");
        return;
    }
    const fullName = fullNameInput.value.trim();
    await registerUser(fullName);
});

googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Google Login User:", user.email);

        if (adminEmails.includes(user.email)) {
            currentUserIsAdmin = true;
            // Admin users bypass IP check and always load their profile
            await loadUserData(user.uid, userIpAddress); // Load or create admin profile
            if (!currentUser) { // If admin profile doesn't exist, create it
                const newAdminData = {
                    name: user.displayName || "Admin",
                    id: user.uid,
                    ipAddress: userIpAddress, // Store current IP for admin too
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
                // Ensure existing admin profile has isAdmin: true
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
            cmdBtn.classList.remove('hidden'); // Show CMD button for admin
            showMessageBox("Đăng nhập Admin thành công!");
        } else {
            await signOut(auth); // Sign out non-admin Google users
            showMessageBox("Bạn không có quyền Admin để đăng nhập bằng Google.");
        }
    } catch (error) {
        console.error("Google login error:", error);
        showMessageBox("Đăng nhập Google thất bại. Vui lòng thử lại.");
    }
});

sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
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

// Load saved theme preference
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeSwitch.checked = true;
    }
    // Initial IP fetch
    fetchUserIpAddress();
});


// --- Group Management Modals and Functions ---

createJoinGroupBtn.addEventListener('click', () => {
    toggleModal(createJoinGroupModal, true);
    // Hide forms initially
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

    const newGroupId = generateUniqueId();
    const groupData = {
        name: groupName,
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        id: newGroupId,
        createdAt: serverTimestamp(),
        members: [currentUser.id],
        isPublic: false, // New groups are private by default, can be joined by ID
        password: groupPassword,
    };

    try {
        const groupDocRef = doc(db, `artifacts/${appId}/public/data/groups`, newGroupId);
        await setDoc(groupDocRef, groupData);

        // Add group to user's group list
        const userProfileDocRef = doc(db, `artifacts/${appId}/users/${currentUser.id}/profile`, 'data');
        await updateDoc(userProfileDocRef, {
            groups: [...(currentUser.groups || []), newGroupId]
        });
        currentUser.groups = [...(currentUser.groups || []), newGroupId]; // Update local state

        showMessageBox("Nhóm đã được tạo thành công!");
        toggleModal(createJoinGroupModal, false);
        newGroupNameInput.value = '';
        newGroupPasswordInput.value = '';
        switchGroup(newGroupId, groupName); // Switch to the newly created group

        await sendSystemMessage(newGroupId, `${currentUser.name} đã tạo nhóm "${groupName}".`);

    } catch (e) {
        console.error("Error creating group: ", e);
        showMessageBox("Đã xảy ra lỗi khi tạo nhóm. Vui lòng thử lại.");
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

            // Add user to group's members list
            await updateDoc(groupDocRef, {
                members: [...currentMembers, currentUser.id]
            });

            // Add group to user's group list
            const userProfileDocRef = doc(db, `artifacts/${appId}/users/${currentUser.id}/profile`, 'data');
            await updateDoc(userProfileDocRef, {
                groups: [...(currentUser.groups || []), groupIdToJoin]
            });
            currentUser.groups = [...(currentUser.groups || []), groupIdToJoin]; // Update local state

            showMessageBox(`Đã tham gia nhóm "${groupData.name}" thành công!`);
            toggleModal(createJoinGroupModal, false);
            joinGroupIdInput.value = '';
            switchGroup(groupIdToJoin, groupData.name); // Switch to the joined group

            await sendSystemMessage(groupIdToJoin, `${currentUser.name} vừa tham gia nhóm.`);

        } else {
            showMessageBox("ID nhóm không tồn tại.");
        }
    } catch (e) {
        console.error("Error joining group: ", e);
        showMessageBox("Đã xảy ra lỗi khi tham gia nhóm. Vui lòng thử lại.");
    }
});

groupInfoBtn.addEventListener('click', async () => {
    if (!activeGroupId || !activeGroupData) {
        showMessageBox("Vui lòng chọn một nhóm để xem thông tin.");
        return;
    }

    // Ensure activeGroupData is up-to-date
    const groupDocRef = doc(db, `artifacts/${appId}/public/data/groups`, activeGroupId);
    const groupSnap = await getDoc(groupDocRef);
    if (groupSnap.exists()) {
        activeGroupData = groupSnap.data();
    } else {
        showMessageBox("Không tìm thấy thông tin nhóm.");
        return;
    }

    infoGroupName.textContent = activeGroupData.name;
    infoGroupCreator.textContent = activeGroupData.creatorName;
    infoGroupId.textContent = activeGroupData.id;
    infoGroupCreationDate.textContent = formatTimestamp(activeGroupData.createdAt);
    infoMemberCount.textContent = (activeGroupData.members ? activeGroupData.members.length : 0);

    toggleModal(groupInfoModal, true);
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
        // Check if the invited user exists
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

        // Add group to invited user's group list
        await updateDoc(invitedUserProfileRef, {
            groups: [...invitedUserGroups, activeGroupId]
        });

        // Add invited user to current group's members list
        const currentGroupMembers = activeGroupData.members || [];
        if (!currentGroupMembers.includes(inviteUserId)) {
            await updateDoc(doc(db, `artifacts/${appId}/public/data/groups`, activeGroupId), {
                members: [...currentGroupMembers, inviteUserId]
            });
            activeGroupData.members.push(inviteUserId); // Update local state
        }

        showMessageBox(`Đã gửi lời mời đến ${invitedUserData.name} thành công!`);
        toggleModal(inviteUserModal, false);
        inviteUserIdInput.value = '';

        await sendSystemMessage(activeGroupId, `${currentUser.name} đã mời ${invitedUserData.name} vào nhóm.`);

    } catch (e) {
        console.error("Error sending invite: ", e);
        showMessageBox("Đã xảy ra lỗi khi gửi lời mời. Vui lòng thử lại.");
    }
});

deleteGroupBtn.addEventListener('click', () => {
    if (!activeGroupId || activeGroupId === 'default-group') {
        showMessageBox("Không thể xóa nhóm chính hoặc không có nhóm nào đang hoạt động.");
        return;
    }
    if (!activeGroupData || activeGroupData.creatorId !== currentUser.id && !currentUserIsAdmin) {
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
        // Delete all messages in the group
        const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${activeGroupId}/messages`);
        const q = query(messagesRef);
        const snapshot = await getDocs(q);
        const batch = db.batch(); // Use batch for multiple deletes
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Remove group from all members' group lists
        const members = activeGroupData.members || [];
        for (const memberId of members) {
            const memberProfileRef = doc(db, `artifacts/${appId}/users/${memberId}/profile`, 'data');
            const memberSnap = await getDoc(memberProfileRef);
            if (memberSnap.exists()) {
                const memberData = memberSnap.data();
                const updatedGroups = (memberData.groups || []).filter(g => g !== activeGroupId);
                await updateDoc(memberProfileRef, { groups: updatedGroups });
            }
        }

        // Delete the group document itself
        await deleteDoc(doc(db, `artifacts/${appId}/public/data/groups`, activeGroupId));

        showMessageBox(`Nhóm "${activeGroupData.name}" đã được xóa thành công!`);
        toggleModal(deleteGroupModal, false);
        deleteGroupPasswordInput.value = '';

        // Switch back to default group
        switchGroup('default-group', 'Dô la - ToanCreator');

    } catch (e) {
        console.error("Error deleting group: ", e);
        showMessageBox("Đã xảy ra lỗi khi xóa nhóm. Vui lòng thử lại.");
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
            cmdInput.value = cmd + ' '; // Add space for parameters
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
    cmdInput.value = ''; // Clear input
    cmdOutput.textContent += `\n> ${command}\n`; // Display command in output

    const parts = command.split(/\s+/);
    const cmd = parts[0];
    const targetId = parts[1]; // For user/group IDs

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
        cmdOutput.textContent += `Lỗi thực thi lệnh: ${e.message || e}\n`;
    }
    cmdOutput.scrollTop = cmdOutput.scrollHeight; // Scroll to bottom
}

async function toggleUserPause(userId, pause) {
    const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
    try {
        await updateDoc(userProfileRef, { isPaused: pause });
        cmdOutput.textContent += `Người dùng ${userId} đã ${pause ? 'bị khóa' : 'được mở khóa'} chat.\n`;
        await sendSystemMessage(activeGroupId, `Admin đã ${pause ? 'khóa' : 'mở khóa'} chat của người dùng ${userId}.`);
    } catch (e) {
        cmdOutput.textContent += `Lỗi khi ${pause ? 'khóa' : 'mở khóa'} người dùng ${userId}: ${e.message}\n`;
    }
}

async function clearMessages(targetId) {
    // Determine if targetId is a user or a group
    // For simplicity, assume if it matches a group ID, it's a group. Otherwise, a user.
    const groupRef = doc(db, `artifacts/${appId}/public/data/groups`, targetId);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) { // It's a group
        const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${targetId}/messages`);
        const q = query(messagesRef);
        const snapshot = await getDocs(q);
        const batch = db.batch();
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        cmdOutput.textContent += `Đã xóa tất cả tin nhắn trong nhóm ${targetId}.\n`;
        await sendSystemMessage(targetId, `Admin đã xóa tất cả tin nhắn trong nhóm này.`);
    } else { // Assume it's a user ID
        const usersCollectionRef = collection(db, `artifacts/${appId}/public/data/groups`);
        const groupsSnapshot = await getDocs(usersCollectionRef);

        for (const groupDoc of groupsSnapshot.docs) {
            const groupId = groupDoc.id;
            const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
            const q = query(messagesRef, where('senderId', '==', targetId));
            const snapshot = await getDocs(q);
            const batch = db.batch();
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }
        cmdOutput.textContent += `Đã xóa tất cả tin nhắn của người dùng ${targetId} trên tất cả các nhóm.\n`;
        await sendSystemMessage(activeGroupId, `Admin đã xóa tất cả tin nhắn của người dùng ${targetId}.`);
    }
}

async function showGroups() {
    const groupsCollectionRef = collection(db, `artifacts/${appId}/public/data/groups`);
    const q = query(groupsCollectionRef);
    const snapshot = await getDocs(q);
    cmdOutput.textContent += "Danh sách các nhóm:\n";
    snapshot.forEach(doc => {
        const data = doc.data();
        cmdOutput.textContent += `- Tên: ${data.name}, ID: ${data.id}, Mật khẩu: ${data.password || 'Không có'}\n`;
    });
}

async function showPeople() {
    const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
    const snapshot = await getDocs(usersCollectionRef);
    cmdOutput.textContent += "Danh sách các tài khoản:\n";
    for (const userDoc of snapshot.docs) {
        const profileDocRef = doc(db, `artifacts/${appId}/users/${userDoc.id}/profile`, 'data');
        const profileSnap = await getDoc(profileDocRef);
        if (profileSnap.exists()) {
            const data = profileSnap.data();
            cmdOutput.textContent += `- Tên: ${data.name}, ID: ${data.id}, Admin: ${data.isAdmin ? 'Có' : 'Không'}, IP: ${data.ipAddress}\n`;
        }
    }
}

async function toggleAllPause(pause) {
    const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
    const snapshot = await getDocs(usersCollectionRef);
    const batch = db.batch();
    snapshot.forEach(userDoc => {
        const profileDocRef = doc(db, `artifacts/${appId}/users/${userDoc.id}/profile`, 'data');
        batch.update(profileDocRef, { isPaused: pause });
    });
    await batch.commit();
    cmdOutput.textContent += `Đã ${pause ? 'khóa' : 'mở khóa'} chat cho tất cả người dùng (trừ admin).\n`;
    await sendSystemMessage(activeGroupId, `Admin đã ${pause ? 'khóa' : 'mở khóa'} chat cho tất cả người dùng.`);
}

async function clearAllMessages() {
    const groupsCollectionRef = collection(db, `artifacts/${appId}/public/data/groups`);
    const groupsSnapshot = await getDocs(groupsCollectionRef);

    for (const groupDoc of groupsSnapshot.docs) {
        const groupId = groupDoc.id;
        const messagesRef = collection(db, `artifacts/${appId}/public/data/groups/${groupId}/messages`);
        const q = query(messagesRef);
        const snapshot = await getDocs(q);
        const batch = db.batch();
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
    cmdOutput.textContent += "Đã xóa tất cả tin nhắn trên tất cả các nhóm.\n";
    await sendSystemMessage(activeGroupId, `Admin đã xóa tất cả tin nhắn trên toàn bộ hệ thống.`);
}

async function banUser(userId) {
    if (userId === currentUser.id) {
        cmdOutput.textContent += "Lỗi: Không thể tự cấm tài khoản của mình.\n";
        return;
    }

    // 1. Remove user from all groups
    const groupsCollectionRef = collection(db, `artifacts/${appId}/public/data/groups`);
    const groupsSnapshot = await getDocs(groupsCollectionRef);

    for (const groupDoc of groupsSnapshot.docs) {
        const groupRef = doc(db, `artifacts/${appId}/public/data/groups`, groupDoc.id);
        const groupData = groupDoc.data();
        const updatedMembers = (groupData.members || []).filter(member => member !== userId);
        await updateDoc(groupRef, { members: updatedMembers });
    }

    // 2. Delete all messages sent by the user
    await clearMessages(userId); // Re-use clearMessages for user's messages

    // 3. Delete user's profile document
    const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profile`, 'data');
    await deleteDoc(userProfileRef);

    cmdOutput.textContent += `Người dùng ${userId} đã bị cấm và xóa khỏi hệ thống.\n`;
    await sendSystemMessage(activeGroupId, `Admin đã cấm và xóa người dùng ${userId} khỏi hệ thống.`);
}

