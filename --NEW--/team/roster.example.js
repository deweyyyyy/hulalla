// Template for roster.js: copy to roster.js and replace with your party's members.
// Department Configuration
const departments = [
    {
        id: 'admin',
        name: 'บริหาร',
        nameEn: 'Management',
        color: '#ff69b4',
        colorLight: '#ffb3d9',
        icon: '👑',
        iconFA: 'fa-crown',
        description: 'บริหารจัดการพรรค วางแผนกลยุทธ์ และประสานงานทุกฝ่าย',
        groupImage: 'assets/group/17.png',
        posterImage: 'assets/group/1.jpg',
        members: ['สมชาย', 'สมหญิง']
    },
    {
        id: 'welfare',
        name: 'ปฏิคม',
        nameEn: 'Reception',
        color: '#ff2121',
        colorLight: '#ff4040',
        icon: '🤝',
        iconFA: 'fa-hands-helping',
        description: 'ดูแลความเป็นอยู่และสวัสดิการของนักเรียน',
        groupImage: 'assets/group/18.png',
        posterImage: 'assets/group/2.jpg',
        members: ['สมชาย', 'สมหญิง']
    },
    {
        id: 'finance',
        name: 'เหรัญญิก',
        nameEn: 'Treasurer',
        color: '#ff9500',
        colorLight: '#ffb84d',
        icon: '💰',
        iconFA: 'fa-coins',
        description: 'จัดการงบประมาณและการเงินของพรรค',
        groupImage: 'assets/group/19.png',
        posterImage: 'assets/group/3.jpg',
        members: ['สมชาย', 'สมหญิง']
    },
    {
        id: 'sports',
        name: 'กีฬา',
        nameEn: 'Sports',
        color: '#e7c31f',
        colorLight: '#ffe600',
        icon: '⚽',
        iconFA: 'fa-futbol',
        description: 'จัดการกิจกรรมกีฬาและส่งเสริมสุขภาพ',
        groupImage: 'assets/group/20.png',
        posterImage: 'assets/group/4.jpg',
        members: ['สมชาย', 'สมหญิง']
    },
    {
        id: 'activity',
        name: 'กิจกรรม',
        nameEn: 'Activities',
        color: '#4caf50',
        colorLight: '#81c784',
        icon: '⭐',
        iconFA: 'fa-star',
        description: 'จัดกิจกรรมสร้างสรรค์และสร้างความสนุกสนาน',
        groupImage: 'assets/group/21.png',
        posterImage: 'assets/group/5.jpg',
        members: ['สมชาย', 'สมหญิง']
    },
    {
        id: 'academic',
        name: 'วิชาการ',
        nameEn: 'Academic',
        color: '#03a9f4',
        colorLight: '#4fc3f7',
        icon: '📚',
        iconFA: 'fa-book',
        description: 'ส่งเสริมการเรียนรู้และพัฒนาทักษะวิชาการ',
        groupImage: 'assets/group/22.png',
        posterImage: 'assets/group/6.jpg',
        members: ['สมชาย', 'สมหญิง']
    },
    {
        id: 'arts',
        name: 'ศิลป์',
        nameEn: 'Art',
        color: '#202add',
        colorLight: '#6490f6',
        icon: '🎨',
        iconFA: 'fa-palette',
        description: 'สร้างสรรค์ผลงานศิลปะและออกแบบ',
        groupImage: 'assets/group/23.png',
        posterImage: 'assets/group/7.jpg',
        members: ['สมชาย', 'สมหญิง']
    },
    {
        id: 'pr',
        name: 'ประชาสัมพันธ์',
        nameEn: 'Public Relations',
        color: '#9c27b0',
        colorLight: '#ba68c8',
        icon: '📢',
        iconFA: 'fa-bullhorn',
        description: 'ประชาสัมพันธ์และสื่อสารกับนักเรียน',
        groupImage: 'assets/group/24.png',
        posterImage: 'assets/group/8.jpg',
        members: ['สมชาย', 'สมหญิง']
    }
];

// Department Heads
const deptHeads = {
    'ประชาสัมพันธ์': 'สมชาย',
    'ปฏิคม': 'สมชาย',
    'เหรัญญิก': 'สมชาย',
    'กิจกรรม': 'สมชาย',
    'ศิลป์': 'สมชาย',
    'วิชาการ': 'สมชาย',
    'กีฬา': 'สมชาย'
};

// Party Leadership
const partyLeadership = [
    { nickname: 'สมชาย', fullname: 'สมชาย ใจดี', position: 'ประธานพรรค', class: '4/1', role: 'บริหาร' },
    { nickname: 'สมหญิง', fullname: 'สมหญิง รักเรียน', position: 'รองประธานพรรค', class: '4/2', role: 'บริหาร' }
];

// Advisors
const advisors = [
    { name: 'อ.ตัวอย่าง นามสมมติ', nickname: 'อ.ตัวอย่าง', image: './assets/indi/aj1.png' }
];

// Members Data (fallback)
const membersData = [
    // id = student ID, also used as the photo filename: assets/indi/<id>.png
    { id: "000001", nickname: "สมชาย", fullname: "สมชาย ใจดี", role: "บริหาร", class: "4/1", gender: "นาย", ig: "somchai.example" },
    { id: "000002", nickname: "สมหญิง", fullname: "สมหญิง รักเรียน", role: "บริหาร", class: "4/2", gender: "นางสาว", ig: "" }
];
