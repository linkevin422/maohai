export const translations: Record<string, { en: string; 'zh-Hant': string }> = {
  // ===== HOME =====
  home_hero_title: {
    en: "Welcome to Maohai",
    "zh-Hant": "歡迎來到毛孩",
  },
  home_hero_subtitle: {
    en: "Explore pet-friendly places across Taiwan.",
    "zh-Hant": "探索全台灣的寵物友善地點。",
  },

  // ===== HEADER =====

  auth_remember: {
    en: "Remember me",
    "zh-Hant": "記住我",
  },
  auth_forgot: {
    en: "Forgot your password?",
    "zh-Hant": "忘記密碼？",
  },
  login_title: {
    en: "Log in to your account",
    "zh-Hant": "登入帳號",
  },  

  auth_error_invalid_credentials: {
    en: "Oops, wrong email or password!",
    "zh-Hant": "帳號或密碼打錯了喔！",
  },
  auth_error_user_not_found: {
    en: "No user found with this email.",
    "zh-Hant": "找不到該帳號，請確認電子郵件是否正確。",
  },
  auth_error_email_not_confirmed: {
    en: "Email not confirmed. Please check your inbox.",
    "zh-Hant": "請先確認信箱，完成帳號啟用。",
  },
  auth_check_spam: {
    en: "If you didn’t get the email in 5 minutes, check your spam folder.",
    "zh-Hant": "如果你在五分鐘內沒收到信，請檢查垃圾郵件。",
  },
  auth_resend_prompt: {
    en: "Still no email? Click below to resend.",
    "zh-Hant": "還是沒收到？點下方按鈕重新發送。",
  },
  auth_resend_button: {
    en: "Resend verification email",
    "zh-Hant": "重新發送驗證信",
  },
  auth_resending: {
    en: "Resending...",
    "zh-Hant": "重新發送中...",
  },
  auth_resend_success: {
    en: "Verification email sent again.",
    "zh-Hant": "驗證信已重新發送。",
  },  
  

header_about: {
  en: "About",
  "zh-Hant": "關於我們",
},

header_articles: {
  en: "Articles",
  "zh-Hant": "文章",
},

header_loveyou: {
  en: "Love You Always",
  "zh-Hant": "永遠愛你",
},

  header_map: {
    en: "Map",
    "zh-Hant": "地圖",
  },
  header_blog: {
    en: "Blog",
    "zh-Hant": "部落格",
  },

  // auth
auth_register_button: {
  en: "Register",
  "zh-Hant": "註冊",
},
auth_login_button: {
  en: "Log In",
  "zh-Hant": "登入",
},
logout_button: {
  en: "Log Out",
  "zh-Hant": "登出",
},

auth_username: {
  en: "Username",
  "zh-Hant": "使用者名稱",
},
auth_confirm_password: {
  en: "Confirm Password",
  "zh-Hant": "確認密碼",
},
auth_error_required: {
  en: "All fields are required.",
  "zh-Hant": "所有欄位皆為必填。",
},
auth_error_mismatch: {
  en: "Passwords do not match.",
  "zh-Hant": "密碼不一致。",
},
auth_error_banned: {
  en: "Username contains banned words.",
  "zh-Hant": "使用者名稱包含不當詞彙。",
},

auth_error_existing_email: {
  en: "Email already registered.",
  "zh-Hant": "此電子郵件已註冊。",
},
auth_success_email_sent: {
  en: "Email sent successfully. Please close this page and confirm your email.",
  "zh-Hant": "信件已發送，請關閉此頁面並前往信箱確認。",
},

register_title: {
  en: "Register Account",
  "zh-Hant": "註冊帳號",
},



  // ===== MAP UI TEXT =====
  map_loading: {
    en: "Loading places...",
    "zh-Hant": "正在載入地點...",
  },
  map_error_loading: {
    en: "Failed to load map data.",
    "zh-Hant": "地圖資料載入失敗。",
  },
  map_toggle_gps: {
    en: "Show My Location",
    "zh-Hant": "顯示我的位置",
  },
  map_key_bookingRequired: {
    en: "Appointment Required",
    "zh-Hant": "預約制",
  },

  map_key_petBagged: {
    en: "Pets must be bagged",
    "zh-Hant": "寵物必須放入包內",
  },
  
  map_popup_suggest_edit: {
    en: "Suggest an Edit",
    "zh-Hant": "建議修改",
  },

  map_popup_add_location: {
    en: "Add this location",
    "zh-Hant": "新增這個地點",
  },

  // ===== SIZE =====
  map_size_small: {
    en: "small",
    "zh-Hant": "小型",
  },
  map_size_medium: {
    en: "medium",
    "zh-Hant": "中型",
  },
  map_size_large: {
    en: "large",
    "zh-Hant": "大型",
  },

  // ===== MAP CATEGORIES =====
  map_category_restaurant: {
    en: "Restaurants",
    "zh-Hant": "寵物友善餐廳",
  },
  map_category_vet: {
    en: "Vets",
    "zh-Hant": "獸醫院",
  },
  map_category_hotel: {
    en: "Hotels",
    "zh-Hant": "寵物旅館",
  },
  map_category_human_hotel: {
    en: "Pet-Friendly Hotels",
    "zh-Hant": "可攜寵物入住的飯店",
  },
  map_category_park: {
    en: "Parks",
    "zh-Hant": "寵物公園",
  },
  map_category_shop: {
    en: "Pet Shops",
    "zh-Hant": "寵物商店",
  },
  map_category_groomer: {
    en: "Grooming Salon",
    "zh-Hant": "寵物美容店",
  },

  // ===== MAP KEYS / PIN PROPERTIES =====
  map_key_petRoam: { en: "Pet can roam freely", "zh-Hant": "寵物可自由活動" },
  map_key_petBagOnly: { en: "Must stay in bag", "zh-Hant": "需放在提籠" },
  map_key_petZone: { en: "Pet must stay in one area", "zh-Hant": "需待在指定區域" },
  map_key_indoorAllowed: { en: "Indoor seating allowed", "zh-Hant": "可攜入室內" },
  map_key_outdoorSeating: { en: "Outdoor seating available", "zh-Hant": "有戶外座位" },
  map_key_petMenu: { en: "Pet menu available", "zh-Hant": "有寵物菜單" },
  map_key_waterBowlProvided: { en: "Water bowl provided", "zh-Hant": "提供水碗" },
  map_key_catFriendly: { en: "Cat-friendly", "zh-Hant": "適合貓" },
  map_key_dogFriendly: { en: "Dog-friendly", "zh-Hant": "適合狗" },
  map_key_maxPetSize: { en: "Max pet size", "zh-Hant": "最大寵物尺寸" },
  map_key_noiseTolerant: { en: "Tolerates barking", "zh-Hant": "接受吠叫聲" },
  map_key_open24hr: { en: "Open 24/7", "zh-Hant": "全天營業" },
  map_key_emergencyAvailable: { en: "Emergency services", "zh-Hant": "急診服務" },
  map_key_exoticsOk: { en: "Exotics welcome", "zh-Hant": "接受特殊寵物" },
  map_key_walkInOk: { en: "Walk-ins allowed", "zh-Hant": "可直接前往" },
  map_key_onlineBooking: { en: "Online booking", "zh-Hant": "提供線上預約" },
  map_key_hasParking: { en: "Has parking", "zh-Hant": "有停車位" },
  map_key_inHouseLab: { en: "In-house lab", "zh-Hant": "有內部檢驗室" },
  map_key_groomingAvailable: { en: "Grooming available", "zh-Hant": "有美容服務" },
  map_key_boardingAvailable: { en: "Boarding available", "zh-Hant": "有住宿服務" },
  map_key_allowLargeDogs: { en: "Allows large dogs", "zh-Hant": "接受大型犬" },
  map_key_maxPets: { en: "Max pets allowed", "zh-Hant": "可攜帶寵物數量" },
  map_key_petFeePerNight: { en: "Fee per night", "zh-Hant": "每晚額外費用" },
  map_key_petWeightLimit: { en: "Pet weight limit (kg)", "zh-Hant": "寵物體重上限 (公斤)" },
  map_key_petAmenities: { en: "Pet amenities provided", "zh-Hant": "提供寵物設備" },
  map_key_petRoomService: { en: "Pet room service", "zh-Hant": "寵物客房服務" },
  map_key_separatePetRooms: { en: "Separate pet rooms", "zh-Hant": "獨立寵物房" },
  map_key_canBeLeftAlone: { en: "Can leave pet alone", "zh-Hant": "可獨自留寵物" },
  map_key_offLeashArea: { en: "Off-leash zone", "zh-Hant": "可放繩區" },
  map_key_fenced: { en: "Fenced area", "zh-Hant": "圍欄區域" },
  map_key_waterAvailable: { en: "Water available", "zh-Hant": "可取水" },
  map_key_shade: { en: "Shaded area", "zh-Hant": "有遮蔽區" },
  map_key_petPoopStations: { en: "Poop stations", "zh-Hant": "寵物便便站" },
  map_key_smallDogZone: { en: "Small dog zone", "zh-Hant": "小型犬專區" },
  map_key_largeDogZone: { en: "Large dog zone", "zh-Hant": "大型犬專區" },
  map_key_catSafe: { en: "Safe for cats", "zh-Hant": "適合貓咪" },
  map_key_allowEntry: { en: "Pets allowed inside", "zh-Hant": "可攜帶寵物入內" },
  map_key_leashRequired: { en: "Leash required", "zh-Hant": "需繫牽繩" },
  map_key_offersGrooming: { en: "Grooming offered", "zh-Hant": "提供寵物美容" },
  map_key_hasPetCafe: { en: "Has pet cafe", "zh-Hant": "設有寵物咖啡廳" },
  map_key_hasVetInside: { en: "Vet inside store", "zh-Hant": "店內有獸醫" },
  map_key_petEvents: { en: "Hosts pet events", "zh-Hant": "舉辦寵物活動" },
  map_key_allowPets: { en: "Pets allowed", "zh-Hant": "可攜帶寵物" },
  map_key_maxPetsPerRoom: { en: "Max pets per room", "zh-Hant": "每房最多寵物數" },
  map_key_hasDesignatedFloors: {
    en: "Has pet-designated floors",
    "zh-Hant": "有寵物專屬樓層",
  },

  // suggestion modal
suggestion_title: {
  en: "Suggest an Edit",
  "zh-Hant": "建議修改",
},
suggestion_reason_label: {
  en: "Reason",
  "zh-Hant": "原因",
},
suggestion_reason_not_exist: {
  en: "Place doesn't exist",
  "zh-Hant": "地點不存在",
},
suggestion_reason_wrong_location: {
  en: "Wrong location on map",
  "zh-Hant": "地圖位置錯誤",
},
suggestion_reason_pet_info: {
  en: "Pet policy is incorrect",
  "zh-Hant": "寵物資訊錯誤",
},
suggestion_reason_broken_link: {
  en: "Broken or incorrect link",
  "zh-Hant": "連結錯誤",
},
suggestion_reason_other: {
  en: "Other",
  "zh-Hant": "其他",
},
suggestion_details_placeholder: {
  en: "What needs to be corrected or added?",
  "zh-Hant": "需要修改或補充什麼？",
},
suggestion_email_placeholder: {
  en: "Your email (optional)",
  "zh-Hant": "你的信箱（可選填）",
},
suggestion_success: {
  en: "Thank you! Your suggestion has been submitted.",
  "zh-Hant": "感謝你！建議已提交。",
},
suggestion_error_empty: {
  en: "Please provide more details.",
  "zh-Hant": "請提供詳細內容。",
},
suggestion_error_submit: {
  en: "Submission failed. Please try again.",
  "zh-Hant": "提交失敗，請再試一次。",
},
button_cancel: {
  en: "Cancel",
  "zh-Hant": "取消",
},
button_submit: {
  en: "Submit",
  "zh-Hant": "送出",
},
button_submitting: {
  en: "Submitting...",
  "zh-Hant": "提交中...",
},

map_popup_submission: {
  en: "Submit a Location",
  "zh-Hant": "新增地點"
},
input_name: {
  en: "Place Name",
  "zh-Hant": "地點名稱"
},
input_address_optional: {
  en: "Address (optional)",
  "zh-Hant": "地址（可選）"
},
input_google_maps_url: {
  en: "Google Maps URL (optional)",
  "zh-Hant": "Google 地圖連結（可選）"
},
map_popup_features: {
  en: "Features",
  "zh-Hant": "地點特色"
},

//submissions

map_key_petAllowed: {
  en: "Pets allowed",
  "zh-Hant": "可帶寵物"
},
map_key_limitByWeight: {
  en: "Weight limit",
  "zh-Hant": "有限重"
},
map_key_additionalFee: {
  en: "Extra pet fee",
  "zh-Hant": "需額外付費"
},
map_key_offLeashOk: {
  en: "Off-leash allowed",
  "zh-Hant": "可不牽繩"
},
map_key_fencedArea: {
  en: "Fenced area",
  "zh-Hant": "有圍欄"
},

mapsubmit_title: {
  en: "Submit New Location",
  "zh-Hant": "新增地點"
},
mapsubmit_url: {
  en: "Google Maps URL",
  "zh-Hant": "Google 地圖連結"
},
mapsubmit_parse: {
  en: "Parse",
  "zh-Hant": "解"
},
mapsubmit_name: {
  en: "Place Name",
  "zh-Hant": "地點名稱"
},
mapsubmit_lat: {
  en: "Latitude",
  "zh-Hant": "緯度"
},
mapsubmit_lng: {
  en: "Longitude",
  "zh-Hant": "經度"
},
mapsubmit_category: {
  en: "Category",
  "zh-Hant": "類別"
},
mapsubmit_fields: {
  en: "Category Details",
  "zh-Hant": "類別細節"
},
mapsubmit_submit: {
  en: "Submit Location",
  "zh-Hant": "送出地點"
},
mapsubmit_submitting: {
  en: "Submitting...",
  "zh-Hant": "送出中..."
},
mapsubmit_success: {
  en: "Submission successful",
  "zh-Hant": "成功送出"
},

  // mapsubmit batch
  mapsubmit_batch_title: {
    en: "🚀 Batch Submit",
    "zh-Hant": "🚀 批次新增",
  },
  mapsubmit_batch_category: {
    en: "Select Category",
    "zh-Hant": "選擇分類",
  },
  mapsubmit_batch_input: {
    en: "Paste multiple Google Maps URLs",
    "zh-Hant": "貼上多筆 Google Maps 連結",
  },
  mapsubmit_batch_placeholder: {
    en: "One per line...",
    "zh-Hant": "每行一筆...",
  },
  mapsubmit_batch_parse: {
    en: "Parse",
    "zh-Hant": "解析",
  },
  mapsubmit_batch_submitting: {
    en: "Submitting...",
    "zh-Hant": "提交中...",
  },
  mapsubmit_batch_submit: {
    en: "Submit All",
    "zh-Hant": "全部送出",
  },
  mapsubmit_batch_success: {
    en: "✅ Batch submitted!",
    "zh-Hant": "✅ 批次送出成功！",
  },

  // Map city jump
map_jump_city: {
  en: "Jump to city",
  "zh-Hant": "快速跳轉城市",
},

// City names
city_Taipei: {
  en: "Taipei",
  "zh-Hant": "台北",
},
city_NewTaipei: {
  en: "New Taipei",
  "zh-Hant": "新北",
},
city_Taoyuan: {
  en: "Taoyuan",
  "zh-Hant": "桃園",
},
city_Hsinchu: {
  en: "Hsinchu",
  "zh-Hant": "新竹",
},
city_Taichung: {
  en: "Taichung",
  "zh-Hant": "台中",
},
city_Chiayi: {
  en: "Chiayi",
  "zh-Hant": "嘉義",
},
city_Tainan: {
  en: "Tainan",
  "zh-Hant": "台南",
},
city_Kaohsiung: {
  en: "Kaohsiung",
  "zh-Hant": "高雄",
},
city_Hualien: {
  en: "Hualien",
  "zh-Hant": "花蓮",
},
city_Taitung: {
  en: "Taitung",
  "zh-Hant": "台東",
},

//about

// inside translations.ts
about_title: {
  en: "About Maohai",
  "zh-Hant": "關於毛孩",
},
about_description: {
  en: "Maohai is Taiwan’s warmest pet map and tool platform. Built for real pet parents who treat their companions like family.",
  "zh-Hant": "毛孩是全台最溫暖的寵物地圖與工具平台，給真正把毛孩當家人的你。",
},
about_line1: {
  en: "Created with love in Taiwan 🇹🇼.",
  "zh-Hant": "誕生於台灣，滿滿的愛。",
},
about_line2: {
  en: "No ads. No trackers. Just useful tools.",
  "zh-Hant": "無廣告、無追蹤，只有實用的功能。",
},
about_line3: {
  en: "We believe every paw deserves respect.",
  "zh-Hant": "我們相信每一隻毛孩都值得被尊重。",
},

//footer

// footer
footer_email_placeholder: {
  en: "Enter your email to subscribe",
  "zh-Hant": "輸入你的 Email 訂閱最新消息",
},
footer_button_subscribe: {
  en: "Subscribe",
  "zh-Hant": "訂閱",
},
footer_success: {
  en: "Thanks for subscribing!",
  "zh-Hant": "感謝訂閱！",
},
footer_error: {
  en: "Subscription failed. Please check your email.",
  "zh-Hant": "訂閱失敗，請確認 Email 是否正確",
},
footer_duplicate: {
  en: "This email is already subscribed.",
  "zh-Hant": "這個 Email 已經訂閱過了",
},
footer_copyright: {
  en: "© 2025 Maohai",
  "zh-Hant": "© 2025 毛孩",
},

//register
auth_email: {
  en: "Email",
  "zh-Hant": "電子郵件",
},
auth_password: {
  en: "Password",
  "zh-Hant": "密碼",
},

//Loading
"unauthorized_meow": {
  "en": "Meow...",
  "zh-Hant": "喵喵..."
},
"unauthorized_woof": {
  "en": "Woof...",
  "zh-Hant": "汪汪..."
}



};
