// Template for roster.js: copy to roster.js and replace with your party's members.
        // Members Data with Instagram (fallback)
        const fallbackMembers = [
            { id: "000001", nickname: "สมชาย", fullname: "สมชาย ใจดี", role: "บริหาร", class: "4/1", gender: "นาย", ig: "somchai.example" },
            { id: "000002", nickname: "สมหญิง", fullname: "สมหญิง รักเรียน", role: "วิชาการ", class: "4/2", gender: "นางสาว", ig: "" }
        ];

        // Executive board cards, shown left to right. card = CSS class of the card
        const executives = [
            {
                "card": "vice-male",
                "nickname": "สมชาย",
                "fullname": "สมชาย นามสมมติ",
                "ig": "",
                "image": "images/000001.png",
                "icon": "👨‍💼",
                "position": "รองชาย"
            },
            {
                "card": "president",
                "nickname": "สมหญิง",
                "fullname": "สมหญิง นามสมมติ",
                "ig": "",
                "image": "images/000002.png",
                "icon": "👩‍💼",
                "position": "ประธาน"
            },
            {
                "card": "vice-female",
                "nickname": "สมใจ",
                "fullname": "สมใจ นามสมมติ",
                "ig": "",
                "image": "images/000003.png",
                "icon": "👩‍💼",
                "position": "รองหญิง"
            },
            {
                "card": "secretary-male",
                "nickname": "สมศักดิ์",
                "fullname": "สมศักดิ์ นามสมมติ",
                "ig": "",
                "image": "images/000004.png",
                "icon": "👨‍💼",
                "position": "เลขาชาย"
            },
            {
                "card": "secretary-female",
                "nickname": "สมศรี",
                "fullname": "สมศรี นามสมมติ",
                "ig": "",
                "image": "images/000005.png",
                "icon": "👩‍💼",
                "position": "เลขาหญิง"
            }
        ];

        // Department head card shown at the top of each department section (key = section id)
        const deptHeadCards = {
            "academic": {
                "nickname": "สมชาย",
                "fullname": "สมชาย ใจดี",
                "ig": "",
                "image": "images/000001.png",
                "icon": "👨‍🎓",
                "role": "วิชาการ",
                "classRoom": "4/1"
            },
            "arts": {
                "nickname": "สมชาย",
                "fullname": "สมชาย ใจดี",
                "ig": "",
                "image": "images/000001.png",
                "icon": "👩‍🎨",
                "role": "ศิลป์",
                "classRoom": "4/1"
            },
            "activity": {
                "nickname": "สมชาย",
                "fullname": "สมชาย ใจดี",
                "ig": "",
                "image": "images/000001.png",
                "icon": "👨‍🎪",
                "role": "กิจกรรม",
                "classRoom": "4/1"
            },
            "sports": {
                "nickname": "สมชาย",
                "fullname": "สมชาย ใจดี",
                "ig": "",
                "image": "images/000001.png",
                "icon": "👨‍⚽",
                "role": "กีฬา",
                "classRoom": "4/1"
            },
            "pr": {
                "nickname": "สมชาย",
                "fullname": "สมชาย ใจดี",
                "ig": "",
                "image": "images/000001.png",
                "icon": "��‍📢",
                "role": "ประชาสัมพันธ์",
                "classRoom": "4/1"
            },
            "welfare": {
                "nickname": "สมชาย",
                "fullname": "สมชาย ใจดี",
                "ig": "",
                "image": "images/000001.png",
                "icon": "👩‍🤝",
                "role": "ปฏฺิคม",
                "classRoom": "4/1"
            },
            "finance": {
                "nickname": "สมชาย",
                "fullname": "สมชาย ใจดี",
                "ig": "",
                "image": "images/000001.png",
                "icon": "👨‍💰",
                "role": "เหรัญญิก",
                "classRoom": "4/1"
            }
        };
