// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCdfy0t-EFhx4vTaoKLPWga76mUofHCXA",
  authDomain: "toancreator-online-study.firebaseapp.com",
  databaseURL: "https://toancreator-online-study-default-rtdb.firebaseio.com", // ĐÃ SỬA LẠI
  projectId: "toancreator-online-study",
  storageBucket: "toancreator-online-study.appspot.com",
  messagingSenderId: "904765786415",
  appId: "1:904765786415:web:8beccb1c80a8f462d6b9da"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// DOM elements
const welcomeScreen = document.getElementById('welcome-screen');
const startChatBtn = document.getElementById('start-chat-btn');
const registrationModal = document.getElementById('registration-modal');
const registrationForm = document.getElementById('registration-form');
const usernameInput = document.getElementById('username');
const setupBtn = document.getElementById('setup-btn');
const googleAdminBtn = document.getElementById('google-admin-btn');
const termsModal = document.getElementById('terms-modal');
const agreeTermsCheckbox = document.getElementById('agree-terms');
const startChatFinalBtn = document.getElementById('start-chat-final-btn');
const chatInterface = document.getElementById('chat-interface');
const themeSwitch = document.getElementById('theme-switch');
const displayName = document.getElementById('display-name');
const userId = document.getElementById('user-id');
const accountCreated = document.getElementById('account-created');
const currentGroupName = document.getElementById('current-group-name');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const groupInfoBtn = document.getElementById('group-info-btn');
const addMemberBtn = document.getElementById('add-member-btn');
const deleteGroupBtn = document.getElementById('delete-group-btn');
const adminCmdBtn = document.getElementById('admin-cmd-btn');
const groupInfoModal = document.getElementById('group-info-modal');
const addGroupModal = document.getElementById('add-group-modal');
const addMemberModal = document.getElementById('add-member-modal');
const deleteGroupModal = document.getElementById('delete-group-modal');
const adminCmdModal = document.getElementById('admin-cmd-modal');
const adminGoogleBtn = document.getElementById('admin-google-btn');
const cmdInput = document.getElementById('cmd-input');
const executeCmdBtn = document.getElementById('execute-cmd-btn');
const cmdOutput = document.getElementById('cmd-output');
const adminLoginPrompt = document.getElementById('admin-login-prompt');
const adminCommands = document.getElementById('admin-commands');
const createTab = document.getElementById('create-tab');
const joinTab = document.getElementById('join-tab');
const createGroupContent = document.getElementById('create-group-content');
const joinGroupContent = document.getElementById('join-group-content');
const createGroupForm = document.getElementById('create-group-form');
const joinGroupForm = document.getElementById('join-group-form');
const newGroupName = document.getElementById('new-group-name');
const groupPassword = document.getElementById('group-password');
const groupIdInput = document.getElementById('group-id');
const joinPassword = document.getElementById('join-password');
const addMemberForm = document.getElementById('add-member-form');
const memberIdInput = document.getElementById('member-id');
const deleteGroupForm = document.getElementById('delete-group-form');
const confirmPassword = document.getElementById('confirm-password');
const contactList = document.querySelector('.contact-list');

// Global variables
let currentUser = null;
let currentGroup = null;
let isAdmin = false;
let userIP = null;

// Initialize the app
function init() {
    console.log('Đang khởi tạo ứng dụng'); // Thêm log kiểm tra
    
    // Kiểm tra theme
    checkThemePreference();
    
    // Ẩn tất cả modal
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });

    // Kiểm tra user đã đăng nhập
    try {
        const savedUser = localStorage.getItem('chatUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            console.log('Phát hiện user đã đăng nhập:', currentUser);
            showChatInterface();
            joinDefaultGroup();
        } else {
            console.log('Chưa có user, hiển thị màn hình chào');
            showWelcomeScreen();
        }
    } catch (e) {
        console.error('Lỗi khi kiểm tra user:', e);
        showWelcomeScreen();
    }
    
    // Lấy địa chỉ IP
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            userIP = data.ip;
            console.log('IP người dùng:', userIP);
        })
        .catch(error => {
            console.error('Lỗi khi lấy IP:', error);
            userIP = 'unknown';
        });
    
    setupEventListeners();
}

function initDefaultData() {
    // Tạo nhóm mặc định nếu chưa tồn tại
    database.ref('groups/default-group').once('value').then(snap => {
        if (!snap.exists()) {
            database.ref('groups/default-group').set({
                name: "Dô la - ToanCreator",
                creatorId: "system",
                createdAt: new Date().toLocaleString('vi-VN')
            });
        }
    });
}

// Gọi hàm khi khởi động
initDefaultData();

// Set up event listeners
function setupEventListeners() {
    // Welcome screen
    startChatBtn.addEventListener('click', showRegistrationModal);
    
    // Registration modal
    setupBtn.addEventListener('click', showTermsModal);
    googleAdminBtn.addEventListener('click', signInWithGoogle);
    
    // Terms modal
    agreeTermsCheckbox.addEventListener('change', function() {
        startChatFinalBtn.disabled = !this.checked;
    });
    startChatFinalBtn.addEventListener('click', registerUser);
    
    // Chat interface
    themeSwitch.addEventListener('change', toggleTheme);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Group actions
    groupInfoBtn.addEventListener('click', showGroupInfo);
    addMemberBtn.addEventListener('click', showAddMemberModal);
    deleteGroupBtn.addEventListener('click', showDeleteGroupModal);
    adminCmdBtn.addEventListener('click', showAdminCmdModal);
    
    // Admin commands
    adminGoogleBtn.addEventListener('click', signInWithGoogle);
    executeCmdBtn.addEventListener('click', executeCommand);
    cmdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            executeCommand();
        }
    });
    
    // Tabs
    createTab.addEventListener('click', function() {
        switchTab('create');
    });
    joinTab.addEventListener('click', function() {
        switchTab('join');
    });
    
    // Forms
    createGroupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createGroup();
    });
    joinGroupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        joinGroup();
    });
    addMemberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        inviteMember();
    });
    deleteGroupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        deleteGroup();
    });
    
    // Close buttons
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Modal close when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Show welcome screen
function showWelcomeScreen() {
    welcomeScreen.style.display = 'flex';
    registrationModal.style.display = 'none';
    termsModal.style.display = 'none';
    chatInterface.style.display = 'none';
}

// Show registration modal
function showRegistrationModal() {
    welcomeScreen.style.display = 'none';
    registrationModal.style.display = 'flex';
}

// Show terms modal
function showTermsModal() {
    const username = usernameInput.value.trim();
    const recaptchaResponse = grecaptcha.getResponse();
    
    if (!username) {
        alert('Vui lòng nhập Họ và Tên');
        return;
    }
    
    if (username.length > 20) {
        alert('Họ và Tên không được vượt quá 20 ký tự');
        return;
    }
    
    if (!recaptchaResponse) {
        alert('Vui lòng xác minh bạn không phải là robot');
        return;
    }
    
    registrationModal.style.display = 'none';
    termsModal.style.display = 'flex';
}

// Register user
function registerUser() {
    try {
        // ... (phần code hiện có)
        
        database.ref('users/' + userIdValue).set({
            username,
            createdAt,
            ip: userIP
        }).then(() => {
            console.log('Dữ liệu đã lưu lên Firebase');
            
            // Thêm delay để đảm bảo dữ liệu được xử lý
            setTimeout(() => {
                showChatInterface();
                joinDefaultGroup();
            }, 500);
            
        }).catch(error => {
            console.error('Lỗi Firebase:', error);
            alert('Lỗi kết nối database. Chi tiết: ' + error.message);
        });
    } catch (e) {
        console.error('Lỗi xử lý đăng ký:', e);
        alert('Lỗi hệ thống: ' + e.message);
    }
}

// Show chat interface
function showChatInterface() {
    // Đảm bảo ẩn tất cả modal trước
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    
    // Hiển thị giao diện chat
    document.getElementById('chat-interface').style.display = 'flex';
    
    // Đảm bảo các phần tử chính hiển thị
    document.querySelector('.sidebar').style.display = 'block';
    document.querySelector('.chat-main').style.display = 'flex';
    
    // Load dữ liệu
    loadUserGroups();
    loadMessages(currentGroup || 'default-group');
    
    console.log('Giao diện chat đã được hiển thị'); // Kiểm tra log
}

// Join default group
function joinDefaultGroup() {
    const defaultGroupId = 'default-group';
    currentGroup = defaultGroupId;
    currentGroupName.textContent = 'Dô la - ToanCreator';
    
    // Kiểm tra nếu user đã trong nhóm
    database.ref('groupMembers/' + defaultGroupId + '/' + currentUser.userId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                // Thêm user vào nhóm
                database.ref('groupMembers/' + defaultGroupId + '/' + currentUser.userId).set({
                    username: currentUser.username,
                    joinedAt: new Date().toLocaleString('vi-VN')
                });
                
                // Thêm nhóm vào userGroups
                database.ref('userGroups/' + currentUser.userId + '/' + defaultGroupId).set({
                    groupName: 'Dô la - ToanCreator',
                    joinedAt: new Date().toLocaleString('vi-VN')
                });
                
                // Gửi thông báo chào mừng
                const welcomeMessage = {
                    senderId: 'system',
                    senderName: 'Hệ thống',
                    content: currentUser.username + ' đã tham gia nhóm',
                    timestamp: new Date().toLocaleString('vi-VN'),
                    type: 'notification'
                };
                database.ref('messages/' + defaultGroupId).push(welcomeMessage);
            }
            
            // Load tin nhắn
            loadMessages(defaultGroupId);
        })
        .catch(error => {
            console.error('Lỗi khi tham gia nhóm mặc định:', error);
        });
}

// Load user groups
function loadUserGroups() {
    // Xóa danh sách nhóm cũ
    contactList.innerHTML = '';
    
    // Thêm nút tạo/tham gia nhóm
    const addGroupItem = document.createElement('div');
    addGroupItem.className = 'contact-item add-group';
    addGroupItem.innerHTML = `
        <div class="contact-avatar">
            <i class="fas fa-plus"></i>
        </div>
        <span>Tạo/Tham gia nhóm</span>
    `;
    addGroupItem.addEventListener('click', () => {
        addGroupModal.style.display = 'flex';
    });
    contactList.appendChild(addGroupItem);
    
    // Luôn thêm nhóm mặc định
    const defaultGroupItem = document.createElement('div');
    defaultGroupItem.className = 'contact-item' + (currentGroup === 'default-group' ? ' selected' : '');
    defaultGroupItem.innerHTML = `
        <div class="contact-avatar">
            <i class="fas fa-users"></i>
        </div>
        <span>Dô la - ToanCreator</span>
    `;
    defaultGroupItem.addEventListener('click', () => {
        currentGroup = 'default-group';
        currentGroupName.textContent = 'Dô la - ToanCreator';
        loadMessages('default-group');
        // Cập nhật selected state
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('selected');
        });
        defaultGroupItem.classList.add('selected');
    });
    contactList.appendChild(defaultGroupItem);
    
    // Load các nhóm khác từ Firebase
    database.ref('userGroups/' + currentUser.userId).on('value', snapshot => {
        if (snapshot.exists()) {
            const groups = snapshot.val();
            Object.keys(groups).forEach(groupId => {
                if (groupId === 'default-group') return; // Đã thêm nhóm mặc định trước đó
                
                const group = groups[groupId];
                const groupItem = document.createElement('div');
                groupItem.className = 'contact-item' + (groupId === currentGroup ? ' selected' : '');
                
                groupItem.innerHTML = `
                    <div class="contact-avatar">
                        <i class="fas fa-users"></i>
                    </div>
                    <span>${group.groupName}</span>
                `;
                
                groupItem.addEventListener('click', () => {
                    currentGroup = groupId;
                    currentGroupName.textContent = group.groupName;
                    loadMessages(groupId);
                    // Cập nhật selected state
                    document.querySelectorAll('.contact-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    groupItem.classList.add('selected');
                });
                
                contactList.appendChild(groupItem);
            });
        }
    });
}

// Load messages
function loadMessages(groupId) {
    chatMessages.innerHTML = '';
    
    database.ref('messages/' + groupId).on('value', snapshot => {
        chatMessages.innerHTML = '';
        
        if (snapshot.exists()) {
            const messages = snapshot.val();
            Object.keys(messages).forEach(messageId => {
                const message = messages[messageId];
                displayMessage(message);
            });
            
            // Scroll to bottom
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    });
}

// Display message
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    
    if (message.type === 'notification') {
        // Notification message
        messageDiv.className = 'notification';
        messageDiv.textContent = message.content;
    } else {
        // Regular message
        messageDiv.className = 'message';
        
        if (message.senderId === currentUser.userId) {
            messageDiv.classList.add('sent');
        } else if (message.senderId === 'admin') {
            messageDiv.classList.add('admin');
        } else {
            messageDiv.classList.add('received');
        }
        
        const isAdminMessage = message.senderId === 'admin';
        
        messageDiv.innerHTML = `
            <div class="message-info">
                <span class="message-user ${isAdminMessage ? 'admin' : ''}">${message.senderName}</span>
                <span class="message-id" onclick="copyToClipboard('${message.senderId}')">ID: ${message.senderId}</span>
                <span class="message-time">${message.timestamp}</span>
            </div>
            <div class="message-content">${message.content}</div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
}

// Send message
function sendMessage() {
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    const message = {
        senderId: currentUser.userId,
        senderName: currentUser.username,
        content,
        timestamp: new Date().toLocaleString('vi-VN'),
        type: 'message'
    };
    
    database.ref('messages/' + currentGroup).push(message);
    messageInput.value = '';
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Kiểm tra kết nối Firebase
function checkFirebaseConnection() {
    const connectedRef = database.ref('.info/connected');
    connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
            console.log('Kết nối Firebase thành công');
        } else {
            console.log('Mất kết nối Firebase');
            alert('Mất kết nối server. Vui lòng tải lại trang.');
        }
    });
}

// Gọi hàm khi khởi động
checkFirebaseConnection();

// Gọi hàm kiểm tra khi khởi động
checkFirebaseConnection();

// Check saved theme preference
function checkThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        themeSwitch.checked = true;
    }
}

// Show group info
function showGroupInfo() {
    database.ref('groups/' + currentGroup).once('value')
        .then(snapshot => {
            if (snapshot.exists()) {
                const group = snapshot.val();
                
                document.getElementById('info-group-name').textContent = group.name;
                document.getElementById('info-group-creator').textContent = group.creatorName;
                document.getElementById('info-group-id').textContent = currentGroup;
                document.getElementById('info-group-created').textContent = group.createdAt;
                
                // Count members
                database.ref('groupMembers/' + currentGroup).once('value')
                    .then(membersSnapshot => {
                        const memberCount = membersSnapshot.numChildren();
                        document.getElementById('info-group-members').textContent = memberCount;
                    });
            } else {
                // Default group info
                document.getElementById('info-group-name').textContent = 'Dô la - ToanCreator';
                document.getElementById('info-group-creator').textContent = 'Hệ thống';
                document.getElementById('info-group-id').textContent = 'default-group';
                document.getElementById('info-group-created').textContent = 'Không xác định';
                
                database.ref('groupMembers/default-group').once('value')
                    .then(membersSnapshot => {
                        const memberCount = membersSnapshot.numChildren();
                        document.getElementById('info-group-members').textContent = memberCount;
                    });
            }
            
            groupInfoModal.style.display = 'flex';
        });
}

// Show add member modal
function showAddMemberModal() {
    addMemberModal.style.display = 'flex';
}

// Show delete group modal
function showDeleteGroupModal() {
    if (currentGroup === 'default-group') {
        alert('Không thể xoá nhóm mặc định');
        return;
    }
    
    deleteGroupModal.style.display = 'flex';
}

// Show admin cmd modal
function showAdminCmdModal() {
    adminCmdModal.style.display = 'flex';
    
    // Check if user is admin
    if (isAdmin) {
        adminLoginPrompt.style.display = 'none';
        adminCommands.style.display = 'block';
    } else {
        adminLoginPrompt.style.display = 'block';
        adminCommands.style.display = 'none';
    }
}

// Switch tabs
function switchTab(tab) {
    if (tab === 'create') {
        createTab.classList.add('active');
        joinTab.classList.remove('active');
        createGroupContent.classList.add('active');
        joinGroupContent.classList.remove('active');
    } else {
        createTab.classList.remove('active');
        joinTab.classList.add('active');
        createGroupContent.classList.remove('active');
        joinGroupContent.classList.add('active');
    }
}

// Create group
function createGroup() {
    const groupName = newGroupName.value.trim();
    const password = groupPassword.value.trim();
    
    if (!groupName) {
        alert('Vui lòng nhập tên nhóm');
        return;
    }
    
    if (groupName.length > 15) {
        alert('Tên nhóm không được vượt quá 15 ký tự');
        return;
    }
    
    if (!password) {
        alert('Vui lòng nhập mật khẩu');
        return;
    }
    
    if (password.length > 8) {
        alert('Mật khẩu không được vượt quá 8 ký tự');
        return;
    }
    
    // Generate group ID
    const groupId = 'group-' + Date.now() + Math.floor(Math.random() * 1000);
    
    // Create group
    database.ref('groups/' + groupId).set({
        name: groupName,
        password,
        creatorId: currentUser.userId,
        creatorName: currentUser.username,
        createdAt: new Date().toLocaleString('vi-VN')
    });
    
    // Add creator to group
    database.ref('groupMembers/' + groupId + '/' + currentUser.userId).set({
        username: currentUser.username,
        joinedAt: new Date().toLocaleString('vi-VN')
    });
    
    // Add group to user's groups
    database.ref('userGroups/' + currentUser.userId + '/' + groupId).set({
        groupName,
        joinedAt: new Date().toLocaleString('vi-VN')
    });
    
    // Clear form and close modal
    newGroupName.value = '';
    groupPassword.value = '';
    addGroupModal.style.display = 'none';
    
    // Switch to new group
    currentGroup = groupId;
    currentGroupName.textContent = groupName;
    loadMessages(groupId);
    loadUserGroups();
}

// Join group
function joinGroup() {
    const groupId = groupIdInput.value.trim();
    const password = joinPassword.value.trim();
    
    if (!groupId) {
        alert('Vui lòng nhập ID nhóm');
        return;
    }
    
    if (!password) {
        alert('Vui lòng nhập mật khẩu');
        return;
    }
    
    // Check if group exists
    database.ref('groups/' + groupId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                alert('Nhóm không tồn tại');
                return;
            }
            
            const group = snapshot.val();
            
            // Check password
            if (group.password !== password) {
                alert('Mật khẩu không đúng');
                return;
            }
            
            // Check if user is already in the group
            database.ref('groupMembers/' + groupId + '/' + currentUser.userId).once('value')
                .then(memberSnapshot => {
                    if (memberSnapshot.exists()) {
                        alert('Bạn đã tham gia nhóm này rồi');
                        return;
                    }
                    
                    // Add user to group
                    database.ref('groupMembers/' + groupId + '/' + currentUser.userId).set({
                        username: currentUser.username,
                        joinedAt: new Date().toLocaleString('vi-VN')
                    });
                    
                    // Add group to user's groups
                    database.ref('userGroups/' + currentUser.userId + '/' + groupId).set({
                        groupName: group.name,
                        joinedAt: new Date().toLocaleString('vi-VN')
                    });
                    
                    // Send notification
                    const notification = {
                        senderId: 'system',
                        senderName: 'Hệ thống',
                        content: currentUser.username + ' đã tham gia nhóm',
                        timestamp: new Date().toLocaleString('vi-VN'),
                        type: 'notification'
                    };
                    
                    database.ref('messages/' + groupId).push(notification);
                    
                    // Clear form and close modal
                    groupIdInput.value = '';
                    joinPassword.value = '';
                    addGroupModal.style.display = 'none';
                    
                    // Switch to joined group
                    currentGroup = groupId;
                    currentGroupName.textContent = group.name;
                    loadMessages(groupId);
                    loadUserGroups();
                });
        });
}

// Invite member
function inviteMember() {
    const memberId = memberIdInput.value.trim();
    
    if (!memberId) {
        alert('Vui lòng nhập ID người dùng');
        return;
    }
    
    // Check if user exists
    database.ref('users/' + memberId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                alert('Người dùng không tồn tại');
                return;
            }
            
            const user = snapshot.val();
            
            // Check if user is already in the group
            database.ref('groupMembers/' + currentGroup + '/' + memberId).once('value')
                .then(memberSnapshot => {
                    if (memberSnapshot.exists()) {
                        alert('Người dùng đã ở trong nhóm này');
                        return;
                    }
                    
                    // Add user to group
                    database.ref('groupMembers/' + currentGroup + '/' + memberId).set({
                        username: user.username,
                        joinedAt: new Date().toLocaleString('vi-VN')
                    });
                    
                    // Add group to user's groups
                    database.ref('userGroups/' + memberId + '/' + currentGroup).set({
                        groupName: currentGroupName.textContent,
                        joinedAt: new Date().toLocaleString('vi-VN')
                    });
                    
                    // Send notification
                    const notification = {
                        senderId: 'system',
                        senderName: 'Hệ thống',
                        content: user.username + ' đã tham gia nhóm',
                        timestamp: new Date().toLocaleString('vi-VN'),
                        type: 'notification'
                    };
                    
                    database.ref('messages/' + currentGroup).push(notification);
                    
                    // Clear form and close modal
                    memberIdInput.value = '';
                    addMemberModal.style.display = 'none';
                });
        });
}

// Delete group
function deleteGroup() {
    const password = confirmPassword.value.trim();
    
    if (!password) {
        alert('Vui lòng nhập mật khẩu');
        return;
    }
    
    // Check group password
    database.ref('groups/' + currentGroup).once('value')
        .then(snapshot => {
            const group = snapshot.val();
            
            if (group.password !== password) {
                alert('Mật khẩu không đúng');
                return;
            }
            
            // Delete group
            database.ref('groups/' + currentGroup).remove();
            
            // Delete group members
            database.ref('groupMembers/' + currentGroup).remove();
            
            // Delete group from users' groups
            database.ref('userGroups').once('value')
                .then(usersSnapshot => {
                    usersSnapshot.forEach(userSnapshot => {
                        database.ref('userGroups/' + userSnapshot.key + '/' + currentGroup).remove();
                    });
                });
            
            // Delete group messages
            database.ref('messages/' + currentGroup).remove();
            
            // Clear form and close modal
            confirmPassword.value = '';
            deleteGroupModal.style.display = 'none';
            
            // Switch to default group
            currentGroup = 'default-group';
            currentGroupName.textContent = 'Dô la - ToanCreator';
            loadMessages('default-group');
            loadUserGroups();
        });
}

// Sign in with Google (Admin)
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then(result => {
            const user = result.user;
            
            // Check if user is admin
            if (user.email === 'tranhoangtoan2k8@gmail.com' || user.email === 'lehuutam20122008@gmail.com') {
                isAdmin = true;
                
                // Update UI
                if (adminCommands) {
                    adminLoginPrompt.style.display = 'none';
                    adminCommands.style.display = 'block';
                }
                
                // Show success message
                alert('Đăng nhập admin thành công');
            } else {
                auth.signOut();
                alert('Bạn không có quyền admin');
            }
        })
        .catch(error => {
            console.error('Error signing in with Google:', error);
            alert('Đăng nhập thất bại');
        });
}

// Execute admin command
function executeCommand() {
    const command = cmdInput.value.trim();
    
    if (!command) return;
    
    // Add command to output
    addToOutput('> ' + command);
    
    // Process command
    const parts = command.split(' ');
    const cmd = parts[0];
    const arg = parts[1];
    
    switch (cmd) {
        case ':pause':
            if (!arg) {
                addToOutput('Lỗi: Thiếu ID người dùng');
                break;
            }
            database.ref('users/' + arg).update({ isPaused: true })
                .then(() => addToOutput(`Đã khoá chat cho người dùng ${arg}`))
                .catch(() => addToOutput('Lỗi: Người dùng không tồn tại'));
            break;
            
        case ':unpause':
            if (!arg) {
                addToOutput('Lỗi: Thiếu ID người dùng');
                break;
            }
            database.ref('users/' + arg).update({ isPaused: false })
                .then(() => addToOutput(`Đã mở chat cho người dùng ${arg}`))
                .catch(() => addToOutput('Lỗi: Người dùng không tồn tại'));
            break;
            
        case ':delete':
            if (!arg) {
                addToOutput('Lỗi: Thiếu ID người dùng');
                break;
            }
            if (!currentGroup) {
                addToOutput('Lỗi: Không có nhóm hiện tại');
                break;
            }
            database.ref('groupMembers/' + currentGroup + '/' + arg).remove()
                .then(() => addToOutput(`Đã xoá người dùng ${arg} khỏi nhóm`))
                .catch(() => addToOutput('Lỗi: Không thể xoá người dùng'));
            break;
            
        case ':clear':
            if (!arg) {
                addToOutput('Lỗi: Thiếu ID người dùng hoặc ID nhóm');
                break;
            }
            
            if (arg.startsWith('group-') || arg === 'default-group') {
                // Clear group messages
                database.ref('messages/' + arg).remove()
                    .then(() => addToOutput(`Đã xoá mọi tin nhắn trong nhóm ${arg}`))
                    .catch(() => addToOutput('Lỗi: Không thể xoá tin nhắn'));
            } else {
                // Clear user messages in current group
                database.ref('messages/' + currentGroup).orderByChild('senderId').equalTo(arg).once('value')
                    .then(snapshot => {
                        const updates = {};
                        snapshot.forEach(child => {
                            updates[child.key] = null;
                        });
                        database.ref('messages/' + currentGroup).update(updates)
                            .then(() => addToOutput(`Đã xoá tin nhắn của người dùng ${arg}`))
                            .catch(() => addToOutput('Lỗi: Không thể xoá tin nhắn'));
                    });
            }
            break;
            
        case ':showgroup':
            database.ref('groups').once('value')
                .then(snapshot => {
                    if (!snapshot.exists()) {
                        addToOutput('Không có nhóm nào');
                        return;
                    }
                    
                    addToOutput('Danh sách nhóm:');
                    snapshot.forEach(group => {
                        addToOutput(`- ${group.val().name} (ID: ${group.key}, Mật khẩu: ${group.val().password})`);
                    });
                });
            break;
            
        case ':showpeople':
            database.ref('users').once('value')
                .then(snapshot => {
                    if (!snapshot.exists()) {
                        addToOutput('Không có người dùng nào');
                        return;
                    }
                    
                    addToOutput('Danh sách người dùng:');
                    snapshot.forEach(user => {
                        addToOutput(`- ${user.val().username} (ID: ${user.key})`);
                    });
                });
            break;
            
        case ':allpause':
            database.ref('users').once('value')
                .then(snapshot => {
                    const updates = {};
                    snapshot.forEach(user => {
                        updates[user.key + '/isPaused'] = true;
                    });
                    database.ref('users').update(updates)
                        .then(() => addToOutput('Đã khoá chat tất cả người dùng'));
                });
            break;
            
        case ':unallpause':
            database.ref('users').once('value')
                .then(snapshot => {
                    const updates = {};
                    snapshot.forEach(user => {
                        updates[user.key + '/isPaused'] = false;
                    });
                    database.ref('users').update(updates)
                        .then(() => addToOutput('Đã mở chat tất cả người dùng'));
                });
            break;
            
        case ':allclear':
            if (!currentGroup) {
                addToOutput('Lỗi: Không có nhóm hiện tại');
                break;
            }
            database.ref('messages/' + currentGroup).remove()
                .then(() => addToOutput('Đã xoá mọi tin nhắn trong nhóm hiện tại'));
            break;
            
        case ':ban':
            if (!arg) {
                addToOutput('Lỗi: Thiếu ID người dùng');
                break;
            }
            // Delete user from all groups
            database.ref('groupMembers').once('value')
                .then(groupsSnapshot => {
                    const updates = {};
                    groupsSnapshot.forEach(group => {
                        updates[group.key + '/' + arg] = null;
                    });
                    database.ref('groupMembers').update(updates);
                    
                    // Delete user's groups
                    database.ref('userGroups/' + arg).remove();
                    
                    // Delete user
                    database.ref('users/' + arg).remove()
                        .then(() => addToOutput(`Đã xoá người dùng ${arg}`));
                });
            break;
            
        default:
            addToOutput('Lỗi: Lệnh không hợp lệ');
    }
    
    cmdInput.value = '';
}

// Add text to command output
function addToOutput(text) {
    const p = document.createElement('p');
    p.textContent = text;
    cmdOutput.appendChild(p);
    cmdOutput.scrollTop = cmdOutput.scrollHeight;
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = 'Đã sao chép!';
            document.body.appendChild(tooltip);
            
            setTimeout(() => {
                tooltip.remove();
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
        });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    checkThemePreference();
    init();
});