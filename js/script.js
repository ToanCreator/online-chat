// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCCdfy0t-EFhx4vTaoKLPWga76mUofHCXA",
    authDomain: "toancreator-online-study.firebaseapp.com",
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
let isInitialized = false;

// Initialize the app
function init() {
    if (isInitialized) return;
    isInitialized = true;

    // Hide all modals first
    hideAllModals();

    // Check if user already exists in localStorage
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showChatInterface();
            joinDefaultGroup();
            return;
        } catch (e) {
            console.error('Error parsing saved user:', e);
            localStorage.removeItem('chatUser');
        }
    }
    
    // Show welcome screen if no user
    showWelcomeScreen();
    
    // Get user IP
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            userIP = data.ip;
        })
        .catch(error => {
            console.error('Error getting IP:', error);
            userIP = 'unknown';
        });
    
    // Set up event listeners
    setupEventListeners();
}

function hideAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
}

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
    if (themeSwitch) themeSwitch.addEventListener('change', toggleTheme);
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Group actions
    if (groupInfoBtn) groupInfoBtn.addEventListener('click', showGroupInfo);
    if (addMemberBtn) addMemberBtn.addEventListener('click', showAddMemberModal);
    if (deleteGroupBtn) deleteGroupBtn.addEventListener('click', showDeleteGroupModal);
    if (adminCmdBtn) adminCmdBtn.addEventListener('click', showAdminCmdModal);
    
    // Admin commands
    if (adminGoogleBtn) adminGoogleBtn.addEventListener('click', signInWithGoogle);
    if (executeCmdBtn) executeCmdBtn.addEventListener('click', executeCommand);
    if (cmdInput) {
        cmdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                executeCommand();
            }
        });
    }
    
    // Tabs
    if (createTab) createTab.addEventListener('click', function() {
        switchTab('create');
    });
    if (joinTab) joinTab.addEventListener('click', function() {
        switchTab('join');
    });
    
    // Forms
    if (createGroupForm) createGroupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        createGroup();
    });
    if (joinGroupForm) joinGroupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        joinGroup();
    });
    if (addMemberForm) addMemberForm.addEventListener('submit', function(e) {
        e.preventDefault();
        inviteMember();
    });
    if (deleteGroupForm) deleteGroupForm.addEventListener('submit', function(e) {
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
    hideAllModals();
    if (welcomeScreen) welcomeScreen.style.display = 'flex';
    if (registrationModal) registrationModal.style.display = 'none';
    if (termsModal) termsModal.style.display = 'none';
    if (chatInterface) chatInterface.style.display = 'none';
}

// Show registration modal
function showRegistrationModal() {
    if (!welcomeScreen || !registrationModal) return;
    welcomeScreen.style.display = 'none';
    registrationModal.style.display = 'flex';
    if (usernameInput) usernameInput.focus();
}

// Show terms modal
function showTermsModal() {
    if (!usernameInput) return;
    
    const username = usernameInput.value.trim();
    let recaptchaResponse = '';
    
    try {
        recaptchaResponse = grecaptcha.getResponse();
    } catch (e) {
        console.error('reCAPTCHA error:', e);
    }
    
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
    
    if (registrationModal) registrationModal.style.display = 'none';
    if (termsModal) termsModal.style.display = 'flex';
}

// Register user
function registerUser() {
    if (!usernameInput) return;
    
    const username = usernameInput.value.trim();
    
    // Generate user ID (timestamp + random number)
    const userIdValue = Date.now() + Math.floor(Math.random() * 1000);
    const createdAt = new Date().toLocaleString('vi-VN');
    
    currentUser = {
        username,
        userId: userIdValue,
        createdAt,
        ip: userIP
    };
    
    // Save user to localStorage
    try {
        localStorage.setItem('chatUser', JSON.stringify(currentUser));
    } catch (e) {
        console.error('Error saving user to localStorage:', e);
        alert('Lỗi khi lưu thông tin người dùng');
        return;
    }
    
    // Save user to Firebase
    database.ref('users/' + userIdValue).set({
        username,
        createdAt,
        ip: userIP
    }).then(() => {
        if (termsModal) termsModal.style.display = 'none';
        showChatInterface();
        joinDefaultGroup();
    }).catch(error => {
        console.error('Error saving user to Firebase:', error);
        alert('Lỗi khi đăng ký người dùng');
    });
}

// Show chat interface
function showChatInterface() {
    hideAllModals();
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (chatInterface) chatInterface.style.display = 'flex';
    
    // Update user info
    if (displayName) displayName.textContent = currentUser.username;
    if (userId) userId.textContent = 'ID: ' + currentUser.userId;
    if (accountCreated) accountCreated.textContent = currentUser.createdAt;
    
    // Load user groups
    loadUserGroups();
}

// Join default group
function joinDefaultGroup() {
    const defaultGroupId = 'default-group';
    currentGroup = defaultGroupId;
    if (currentGroupName) currentGroupName.textContent = 'Dô la - ToanCreator';
    
    // Check if user is already in the group
    database.ref('groupMembers/' + defaultGroupId + '/' + currentUser.userId).once('value')
        .then(snapshot => {
            if (!snapshot.exists()) {
                // Add user to group
                database.ref('groupMembers/' + defaultGroupId + '/' + currentUser.userId).set({
                    username: currentUser.username,
                    joinedAt: new Date().toLocaleString('vi-VN')
                });
                
                // Add group to user's groups
                database.ref('userGroups/' + currentUser.userId + '/' + defaultGroupId).set({
                    groupName: 'Dô la - ToanCreator',
                    joinedAt: new Date().toLocaleString('vi-VN')
                });
                
                // Send welcome message
                const welcomeMessage = {
                    senderId: 'system',
                    senderName: 'Hệ thống',
                    content: currentUser.username + ' đã tham gia nhóm',
                    timestamp: new Date().toLocaleString('vi-VN'),
                    type: 'notification'
                };
                
                database.ref('messages/' + defaultGroupId).push(welcomeMessage);
            }
            
            // Load messages
            loadMessages(defaultGroupId);
        }).catch(error => {
            console.error('Error joining default group:', error);
        });
}

// Load user groups
function loadUserGroups() {
    if (!contactList) return;
    
    database.ref('userGroups/' + currentUser.userId).on('value', snapshot => {
        contactList.innerHTML = '';
        
        // Add create/join group button
        const addGroupItem = document.createElement('div');
        addGroupItem.className = 'contact-item add-group';
        addGroupItem.innerHTML = `
            <div class="contact-avatar">
                <i class="fas fa-plus"></i>
            </div>
            <span>Tạo/Tham gia nhóm</span>
        `;
        addGroupItem.addEventListener('click', function() {
            if (addGroupModal) addGroupModal.style.display = 'flex';
        });
        contactList.appendChild(addGroupItem);
        
        // Add groups
        if (snapshot.exists()) {
            const groups = snapshot.val();
            Object.keys(groups).forEach(groupId => {
                const group = groups[groupId];
                const groupItem = document.createElement('div');
                groupItem.className = 'contact-item';
                if (groupId === currentGroup) {
                    groupItem.classList.add('selected');
                }
                
                groupItem.innerHTML = `
                    <div class="contact-avatar">
                        <i class="fas fa-users"></i>
                    </div>
                    <span>${group.groupName}</span>
                `;
                
                groupItem.addEventListener('click', function() {
                    // Remove selected class from all items
                    document.querySelectorAll('.contact-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // Add selected class to clicked item
                    this.classList.add('selected');
                    
                    // Update current group and load messages
                    currentGroup = groupId;
                    if (currentGroupName) currentGroupName.textContent = group.groupName;
                    loadMessages(groupId);
                });
                
                contactList.appendChild(groupItem);
            });
        }
    }, error => {
        console.error('Error loading user groups:', error);
    });
}

// Load messages
function loadMessages(groupId) {
    if (!chatMessages) return;
    
    chatMessages.innerHTML = '';
    
    database.ref('messages/' + groupId).on('value', snapshot => {
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        
        if (snapshot.exists()) {
            const messages = snapshot.val();
            Object.keys(messages).forEach(messageId => {
                const message = messages[messageId];
                displayMessage(message);
            });
            
            // Scroll to bottom
            setTimeout(() => {
                if (chatMessages) chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }, error => {
        console.error('Error loading messages:', error);
    });
}

// Display message
function displayMessage(message) {
    if (!chatMessages) return;
    
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
    if (!messageInput || !currentGroup) return;
    
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    const message = {
        senderId: currentUser.userId,
        senderName: currentUser.username,
        content,
        timestamp: new Date().toLocaleString('vi-VN'),
        type: 'message'
    };
    
    database.ref('messages/' + currentGroup).push(message)
        .then(() => {
            if (messageInput) messageInput.value = '';
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
}

// Toggle theme
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Check saved theme preference
function checkThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        if (themeSwitch) themeSwitch.checked = true;
    }
}

// Show group info
function showGroupInfo() {
    if (!currentGroup || !groupInfoModal) return;
    
    database.ref('groups/' + currentGroup).once('value')
        .then(snapshot => {
            if (!groupInfoModal) return;
            
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
        })
        .catch(error => {
            console.error('Error loading group info:', error);
        });
}

// Show add member modal
function showAddMemberModal() {
    if (addMemberModal) addMemberModal.style.display = 'flex';
}

// Show delete group modal
function showDeleteGroupModal() {
    if (!deleteGroupModal) return;
    
    if (currentGroup === 'default-group') {
        alert('Không thể xoá nhóm mặc định');
        return;
    }
    
    deleteGroupModal.style.display = 'flex';
}

// Show admin cmd modal
function showAdminCmdModal() {
    if (!adminCmdModal) return;
    
    adminCmdModal.style.display = 'flex';
    
    // Check if user is admin
    if (isAdmin) {
        if (adminLoginPrompt) adminLoginPrompt.style.display = 'none';
        if (adminCommands) adminCommands.style.display = 'block';
    } else {
        if (adminLoginPrompt) adminLoginPrompt.style.display = 'block';
        if (adminCommands) adminCommands.style.display = 'none';
    }
}

// Switch tabs
function switchTab(tab) {
    if (!createTab || !joinTab || !createGroupContent || !joinGroupContent) return;
    
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
    if (!newGroupName || !groupPassword) return;
    
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
    }).then(() => {
        // Add creator to group
        return database.ref('groupMembers/' + groupId + '/' + currentUser.userId).set({
            username: currentUser.username,
            joinedAt: new Date().toLocaleString('vi-VN')
        });
    }).then(() => {
        // Add group to user's groups
        return database.ref('userGroups/' + currentUser.userId + '/' + groupId).set({
            groupName,
            joinedAt: new Date().toLocaleString('vi-VN')
        });
    }).then(() => {
        // Clear form and close modal
        if (newGroupName) newGroupName.value = '';
        if (groupPassword) groupPassword.value = '';
        if (addGroupModal) addGroupModal.style.display = 'none';
        
        // Switch to new group
        currentGroup = groupId;
        if (currentGroupName) currentGroupName.textContent = groupName;
        loadMessages(groupId);
        loadUserGroups();
    }).catch(error => {
        console.error('Error creating group:', error);
        alert('Lỗi khi tạo nhóm');
    });
}

// Join group
function joinGroup() {
    if (!groupIdInput || !joinPassword) return;
    
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
            return database.ref('groupMembers/' + groupId + '/' + currentUser.userId).once('value')
                .then(memberSnapshot => {
                    if (memberSnapshot.exists()) {
                        alert('Bạn đã tham gia nhóm này rồi');
                        return;
                    }
                    
                    // Add user to group
                    return database.ref('groupMembers/' + groupId + '/' + currentUser.userId).set({
                        username: currentUser.username,
                        joinedAt: new Date().toLocaleString('vi-VN')
                    }).then(() => {
                        // Add group to user's groups
                        return database.ref('userGroups/' + currentUser.userId + '/' + groupId).set({
                            groupName: group.name,
                            joinedAt: new Date().toLocaleString('vi-VN')
                        });
                    }).then(() => {
                        // Send notification
                        const notification = {
                            senderId: 'system',
                            senderName: 'Hệ thống',
                            content: currentUser.username + ' đã tham gia nhóm',
                            timestamp: new Date().toLocaleString('vi-VN'),
                            type: 'notification'
                        };
                        
                        return database.ref('messages/' + groupId).push(notification);
                    }).then(() => {
                        // Clear form and close modal
                        if (groupIdInput) groupIdInput.value = '';
                        if (joinPassword) joinPassword.value = '';
                        if (addGroupModal) addGroupModal.style.display = 'none';
                        
                        // Switch to joined group
                        currentGroup = groupId;
                        if (currentGroupName) currentGroupName.textContent = group.name;
                        loadMessages(groupId);
                        loadUserGroups();
                    });
                });
        })
        .catch(error => {
            console.error('Error joining group:', error);
            alert('Lỗi khi tham gia nhóm');
        });
}

// Invite member
function inviteMember() {
    if (!memberIdInput) return;
    
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
            return database.ref('groupMembers/' + currentGroup + '/' + memberId).once('value')
                .then(memberSnapshot => {
                    if (memberSnapshot.exists()) {
                        alert('Người dùng đã ở trong nhóm này');
                        return;
                    }
                    
                    // Add user to group
                    return database.ref('groupMembers/' + currentGroup + '/' + memberId).set({
                        username: user.username,
                        joinedAt: new Date().toLocaleString('vi-VN')
                    }).then(() => {
                        // Add group to user's groups
                        return database.ref('userGroups/' + memberId + '/' + currentGroup).set({
                            groupName: currentGroupName ? currentGroupName.textContent : 'Nhóm không tên',
                            joinedAt: new Date().toLocaleString('vi-VN')
                        });
                    }).then(() => {
                        // Send notification
                        const notification = {
                            senderId: 'system',
                            senderName: 'Hệ thống',
                            content: user.username + ' đã tham gia nhóm',
                            timestamp: new Date().toLocaleString('vi-VN'),
                            type: 'notification'
                        };
                        
                        return database.ref('messages/' + currentGroup).push(notification);
                    }).then(() => {
                        // Clear form and close modal
                        if (memberIdInput) memberIdInput.value = '';
                        if (addMemberModal) addMemberModal.style.display = 'none';
                    });
                });
        })
        .catch(error => {
            console.error('Error inviting member:', error);
            alert('Lỗi khi mời thành viên');
        });
}

// Delete group
function deleteGroup() {
    if (!confirmPassword) return;
    
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
            return database.ref('groups/' + currentGroup).remove();
        })
        .then(() => {
            // Delete group members
            return database.ref('groupMembers/' + currentGroup).remove();
        })
        .then(() => {
            // Delete group from users' groups
            return database.ref('userGroups').once('value')
                .then(usersSnapshot => {
                    const updates = {};
                    usersSnapshot.forEach(userSnapshot => {
                        updates[`${userSnapshot.key}/${currentGroup}`] = null;
                    });
                    return database.ref('userGroups').update(updates);
                });
        })
        .then(() => {
            // Delete group messages
            return database.ref('messages/' + currentGroup).remove();
        })
        .then(() => {
            // Clear form and close modal
            if (confirmPassword) confirmPassword.value = '';
            if (deleteGroupModal) deleteGroupModal.style.display = 'none';
            
            // Switch to default group
            currentGroup = 'default-group';
            if (currentGroupName) currentGroupName.textContent = 'Dô la - ToanCreator';
            loadMessages('default-group');
            loadUserGroups();
        })
        .catch(error => {
            console.error('Error deleting group:', error);
            alert('Lỗi khi xoá nhóm');
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
                if (adminLoginPrompt) adminLoginPrompt.style.display = 'none';
                if (adminCommands) adminCommands.style.display = 'block';
                
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
    if (!cmdInput || !cmdOutput) return;
    
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
    
    if (cmdInput) cmdInput.value = '';
}

// Add text to command output
// Add text to command output
function addToOutput(text) {
    if (!cmdOutput) return;
    
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

// Make copyToClipboard available globally
window.copyToClipboard = copyToClipboard;