import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Sparkles, Download, RefreshCw, ChevronLeft, 
  Check, Save, AlertCircle, Type, Eraser, Grid, Wand2,
  Briefcase, GraduationCap, MessageCircle, UserCheck, Heart,
  Camera, LogIn, LogOut, X, User as UserIcon
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously
} from "firebase/auth";

// --- 初始化 Firebase ---
const firebaseConfig = {
  // apiKey: "您的-firebase-api-key",
  // authDomain: "...",
  // ... (如果沒有 Firebase，保留這裡為空即可，只會影響登入功能)
};

// 初始化 App (容錯處理)
let app;
let auth;
try {
  const configToUse = Object.keys(firebaseConfig).length > 0 
    ? firebaseConfig 
    : (typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null);

  if (configToUse) {
    app = initializeApp(configToUse);
    auth = getAuth(app);
  }
} catch (e) {
  console.warn("Firebase 初始化跳過");
}

// --- 資料庫分類定義 ---
const CATEGORIES = {
  WORK: { id: 'work', name: '社畜 (職場)', icon: Briefcase },
  STUDENT: { id: 'student', name: '學生 (校園)', icon: GraduationCap },
  NONSENSE: { id: 'nonsense', name: '喇賽 (迷因)', icon: MessageCircle },
  FORMAL: { id: 'formal', name: '正式 (日常)', icon: UserCheck },
  LOVE: { id: 'love', name: '戀愛 (暈船)', icon: Heart },
};

// --- 150+ 組分類語庫 ---
const MEME_DATABASE = [
  { category: 'work', text: "收到", mood: "敬禮，表情嚴肅認真" },
  { category: 'work', text: "辛苦了", mood: "遞出毛巾或飲料，溫柔的微笑" },
  { category: 'work', text: "準時下班", mood: "以跑百米的速度奔跑，表情興奮" },
  { category: 'work', text: "心好累", mood: "趴在桌子上，靈魂出竅的樣子" },
  { category: 'work', text: "薪水小偷", mood: "躲在角落滑手機，表情賊頭賊腦" },
  { category: 'work', text: "老闆是對的", mood: "強顏歡笑，比出大拇指，額頭冒汗" },
  { category: 'work', text: "加薪無望", mood: "看著空錢包，流下一滴淚" },
  { category: 'work', text: "求放過", mood: "雙手合十跪地求饒" },
  { category: 'work', text: "這鍋我不背", mood: "雙手推開一個黑色的鍋子" },
  { category: 'work', text: "我就廢", mood: "躺平在地上，蓋著被子" },
  { category: 'work', text: "不想上班", mood: "抓著床單不放，一臉痛苦" },
  { category: 'work', text: "我是誰我在哪", mood: "一臉茫然，周圍有問號旋轉" },
  { category: 'work', text: "月底吃土", mood: "拿著湯匙挖土吃" },
  { category: 'work', text: "能者過勞", mood: "背著巨大的石頭，滿頭大汗" },
  { category: 'work', text: "我要離職", mood: "拿著辭呈，眼神堅定" },
  { category: 'work', text: "電腦當機", mood: "對著電腦崩潰尖叫" },
  { category: 'work', text: "客戶是神", mood: "雙手合十膜拜" },
  { category: 'work', text: "開會中", mood: "貼著膠帶封口，眼神死" },
  { category: 'work', text: "又加班", mood: "看著窗外月亮，背影淒涼" },
  { category: 'work', text: "年終呢", mood: "拿著放大鏡在地上找東西" },
  { category: 'work', text: "想退休", mood: "拄著拐杖，鬍子變白" },
  { category: 'work', text: "幫我撐十秒", mood: "表情痛苦地支撐著天花板" },
  { category: 'work', text: "這方案不錯", mood: "摸著下巴假裝思考" },
  { category: 'work', text: "預算不足", mood: "翻開空空的口袋" },
  { category: 'work', text: "明天再說", mood: "鑽進睡袋裡拉上拉鍊" },
  { category: 'work', text: "我盡力了", mood: "倒在地上舉白旗" },
  { category: 'work', text: "先走了", mood: "戴墨鏡帥氣轉身" },
  { category: 'work', text: "您說的是", mood: "點頭如搗蒜" },
  { category: 'work', text: "咖啡續命", mood: "打著點滴，裡面是黑咖啡" },
  { category: 'work', text: "禮拜五了", mood: "雙手舉高歡呼，背景放煙火" },
  { category: 'student', text: "歐趴", mood: "拿著考卷寫100分，表情得意" },
  { category: 'student', text: "被當", mood: "被巨大的F字母壓在地上" },
  { category: 'student', text: "點名沒", mood: "驚慌失措地從後門探頭" },
  { category: 'student', text: "借我抄", mood: "雙手合十，眼神誠懇" },
  { category: 'student', text: "教授在看", mood: "用書擋住臉，只露出眼睛" },
  { category: 'student', text: "幾點下課", mood: "一直看手錶，表情不耐煩" },
  { category: 'student', text: "學霸", mood: "戴著眼鏡，發出智慧的光芒" },
  { category: 'student', text: "學渣", mood: "頭上長草，一臉呆滯" },
  { category: 'student', text: "早八", mood: "像殭屍一樣行走，黑眼圈很深" },
  { category: 'student', text: "選課戰爭", mood: "綁頭帶，對著電腦瘋狂點擊" },
  { category: 'student', text: "求凱瑞", mood: "抱著別人的大腿痛哭" },
  { category: 'student', text: "都在書裡", mood: "被書本淹沒，只伸出一隻手" },
  { category: 'student', text: "我沒讀書", mood: "攤手，一臉無辜(其實考很高)" },
  { category: 'student', text: "明天考試", mood: "抱頭崩潰尖叫" },
  { category: 'student', text: "暑假快樂", mood: "戴草帽穿泳圈" },
  { category: 'student', text: "寒假快樂", mood: "圍圍巾吃火鍋" },
  { category: 'student', text: "交作業", mood: "像飛盤一樣丟出文件" },
  { category: 'student', text: "分組報告", mood: "一個人拉著整台車" },
  { category: 'student', text: "我要睡覺", mood: "直接趴在桌上流口水" },
  { category: 'student', text: "肚子餓", mood: "肚子發出雷聲，表情委屈" },
  { category: 'student', text: "什麼時候畢業", mood: "望著遠方發呆" },
  { category: 'student', text: "宿舍好熱", mood: "拿扇子狂搧，吐舌頭" },
  { category: 'student', text: "沒錢吃飯", mood: "拿著空碗敲碗" },
  { category: 'student', text: "記得帶傘", mood: "撐著傘，提醒的表情" },
  { category: 'student', text: "遲到了", mood: "咬著吐司狂奔" },
  { category: 'student', text: "老師好", mood: "立正敬禮" },
  { category: 'student', text: "同學互助", mood: "搭著肩膀比讚" },
  { category: 'student', text: "社團活動", mood: "拿著吉他或球具" },
  { category: 'student', text: "期中地獄", mood: "周圍都是火海" },
  { category: 'student', text: "期末解脫", mood: "張開雙臂飛向天空" },
  { category: 'nonsense', text: "笑死", mood: "誇張大笑，笑到流淚" },
  { category: 'nonsense', text: "歸剛欸", mood: "憤怒大喊，背景紅色震動" },
  { category: 'nonsense', text: "確實", mood: "摸下巴點頭，一臉高深" },
  { category: 'nonsense', text: "沒圖沒真相", mood: "雙手交叉，伸手要證據" },
  { category: 'nonsense', text: "下去", mood: "大拇指朝下" },
  { category: 'nonsense', text: "可憐哪", mood: "嘲諷的微笑，眼神輕蔑" },
  { category: 'nonsense', text: "是在哈囉", mood: "手放耳朵旁，翻白眼" },
  { category: 'nonsense', text: "就這?", mood: "一臉不屑，攤手" },
  { category: 'nonsense', text: "太神啦", mood: "雙手舉高膜拜，背後有聖光" },
  { category: 'nonsense', text: "我看了什麼", mood: "自戳雙眼" },
  { category: 'nonsense', text: "先不要", mood: "雙手阻擋，身體後退" },
  { category: 'nonsense', text: "興奮到模糊", mood: "快速晃動，產生殘影" },
  { category: 'nonsense', text: "吃瓜", mood: "拿著西瓜在旁邊看戲" },
  { category: 'nonsense', text: "上車", mood: "戴司機帽招手" },
  { category: 'nonsense', text: "芭比Q了", mood: "臉色發青，背景失火" },
  { category: 'nonsense', text: "真香", mood: "大口吃東西，表情陶醉" },
  { category: 'nonsense', text: "杰哥不要", mood: "驚恐表情，手向外推" },
  { category: 'nonsense', text: "阿姨我不想努力", mood: "一臉疲憊求包養" },
  { category: 'nonsense', text: "奇怪知識增加", mood: "頭上燈泡發光，宇宙背景" },
  { category: 'nonsense', text: "小丑竟是我", mood: "畫著小丑妝，流下一滴淚" },
  { category: 'nonsense', text: "急了", mood: "指著對方笑" },
  { category: 'nonsense', text: "破防了", mood: "摀著胸口倒地" },
  { category: 'nonsense', text: "菜就多練", mood: "雙手抱胸，一臉教練樣" },
  { category: 'nonsense', text: "這波不虧", mood: "按計算機，精打細算" },
  { category: 'nonsense', text: "還好我沒錢", mood: "翻開空錢包笑" },
  { category: 'nonsense', text: "貧窮限制想像", mood: "望著金山銀山發呆" },
  { category: 'nonsense', text: "刷新三觀", mood: "眼鏡碎掉，目瞪口呆" },
  { category: 'nonsense', text: "這畫面太美", mood: "遮眼睛從指縫偷看" },
  { category: 'nonsense', text: "Duck不必", mood: "鴨子比叉叉" },
  { category: 'nonsense', text: "咩噗", mood: "一臉委屈快哭" },
  { category: 'formal', text: "早安", mood: "陽光下揮手微笑" },
  { category: 'formal', text: "晚安", mood: "蓋被子睡覺，旁邊有月亮" },
  { category: 'formal', text: "謝謝", mood: "雙手合十，微微鞠躬" },
  { category: 'formal', text: "不客氣", mood: "揮手，笑容燦爛" },
  { category: 'formal', text: "麻煩了", mood: "90度鞠躬" },
  { category: 'formal', text: "收到", mood: "比出OK手勢" },
  { category: 'formal', text: "沒問題", mood: "拍胸脯保證" },
  { category: 'formal', text: "好的", mood: "點頭微笑" },
  { category: 'formal', text: "加油", mood: "握拳比出奮鬥姿勢" },
  { category: 'formal', text: "恭喜", mood: "拉禮炮，彩帶飄落" },
  { category: 'formal', text: "生日快樂", mood: "捧著蛋糕吹蠟燭" },
  { category: 'formal', text: "新年快樂", mood: "拿著紅包拱手拜年" },
  { category: 'formal', text: "好久不見", mood: "張開雙臂準備擁抱" },
  { category: 'formal', text: "保重", mood: "拍拍肩膀，眼神關心" },
  { category: 'formal', text: "路上小心", mood: "揮舞手帕道別" },
  { category: 'formal', text: "了解", mood: "推眼鏡，認真點頭" },
  { category: 'formal', text: "稍等一下", mood: "比出「暫停」手勢" },
  { category: 'formal', text: "在那邊", mood: "手指指向遠方" },
  { category: 'formal', text: "是的", mood: "堅定地點頭" },
  { category: 'formal', text: "不是喔", mood: "搖手否認" },
  { category: 'formal', text: "可以", mood: "比出大拇指" },
  { category: 'formal', text: "不可以", mood: "雙手打叉" },
  { category: 'formal', text: "請問", mood: "舉手發問" },
  { category: 'formal', text: "不好意思", mood: "搔頭，一臉抱歉" },
  { category: 'formal', text: "對不起", mood: "土下座道歉" },
  { category: 'formal', text: "歡迎", mood: "鋪紅地毯，鞠躬" },
  { category: 'formal', text: "再見", mood: "背對鏡頭揮手" },
  { category: 'formal', text: "一路順風", mood: "對著飛機揮手" },
  { category: 'formal', text: "多謝款待", mood: "摸著肚子，一臉滿足" },
  { category: 'formal', text: "合作愉快", mood: "握手" },
  { category: 'love', text: "想你", mood: "托腮看著窗外，周圍有愛心" },
  { category: 'love', text: "愛你", mood: "雙手比愛心，眼睛也是愛心" },
  { category: 'love', text: "抱抱", mood: "張開雙臂求擁抱" },
  { category: 'love', text: "暈船", mood: "眼睛變成漩渦狀" },
  { category: 'love', text: "寶貝", mood: "飛吻" },
  { category: 'love', text: "親一個", mood: "嘟嘴準備親親" },
  { category: 'love', text: "在幹嘛", mood: "趴在床上講電話" },
  { category: 'love', text: "已讀不回", mood: "盯著手機，背後有陰影" },
  { category: 'love', text: "森七七", mood: "鼓起臉頰生氣" },
  { category: 'love', text: "好想見你", mood: "抱著對方的照片哭" },
  { category: 'love', text: "你最好了", mood: "抱著大腿撒嬌" },
  { category: 'love', text: "早點睡", mood: "幫忙蓋被子" },
  { category: 'love', text: "多喝水", mood: "遞出水杯，一臉關心" },
  { category: 'love', text: "別生氣", mood: "拿著花跪地求饒" },
  { category: 'love', text: "我錯了", mood: "跪算盤" },
  { category: 'love', text: "好害羞", mood: "雙手摀臉，指縫偷看" },
  { category: 'love', text: "心碎", mood: "捧著破碎的心臟" },
  { category: 'love', text: "被閃瞎", mood: "戴墨鏡擋住強光" },
  { category: 'love', text: "單身狗", mood: "穿著狗布偶裝，在風中發抖" },
  { category: 'love', text: "求介紹", mood: "拿著徵友牌子" },
  { category: 'love', text: "穩交中", mood: "兩個人手牽手背影" },
  { category: 'love', text: "約嗎", mood: "挑眉壞笑" },
  { category: 'love', text: "等你喔", mood: "坐在長椅上看錶" },
  { category: 'love', text: "笨蛋", mood: "輕敲對方的頭" },
  { category: 'love', text: "偷看你", mood: "從牆角探頭出來" },
  { category: 'love', text: "心動", mood: "按著胸口，心跳很快" },
  { category: 'love', text: "融化了", mood: "變成一灘水" },
  { category: 'love', text: "我是你的", mood: "把自己綁上緞帶" },
  { category: 'love', text: "永遠愛你", mood: "拿著鑽戒單膝下跪" },
  { category: 'love', text: "我們結婚吧", mood: "穿著婚紗/西裝" }
];

const STYLES = [
  { id: 'line-sticker', name: 'Q版貼圖', prompt: 'Chibi style, big head small body, thick vector outlines, flat colors, simple and cute' },
  { id: 'manga', name: '日系動漫', prompt: 'Japanese shonen manga style, bold black ink lines, cel shading, exaggerated emotional expressions' },
  { id: 'disney', name: '3D 動畫', prompt: 'Modern 3D Pixar style, soft lighting, 3D rendered cute character, expressive big eyes' },
  { id: 'retro', name: '美式復古', prompt: 'Retro 90s cartoon style, thick outlines, vibrant pop art colors, halftone patterns' },
  { id: 'sketch', name: '手繪素描', prompt: 'Pencil sketch style, rough artistic lines, charcoal texture, artistic vibe' }
];

const App = () => {
  // --- State ---
  const [step, setStep] = useState(1);
  const [sourceImage, setSourceImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLES[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stickers, setStickers] = useState([]);
  const [status, setStatus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customTexts, setCustomTexts] = useState(Array(9).fill(''));
  
  // Auth State
  const [user, setUser] = useState(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  
  // !!! 請填入您的 Gemini API Key !!!
  // 範例: const apiKey = "AIzaSyDaBcDeFgHiJkLmNoPqRsTuVwXyZ";
  const apiKey = "AIzaSyCDDMlPs4rs8Yviya6PsXkV6OcBu8K4QC4"; 
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // --- Auth Effect ---
  useEffect(() => {
    if (!auth) return;

    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth).catch(err => console.log("匿名登入失敗:", err));
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // --- Handlers: Auth ---
  const handleGoogleLogin = async () => {
    if (!auth) {
      alert("請先設定 Firebase Config 才能使用登入功能");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google login failed", error);
      alert("登入失敗，請確認 Firebase 設定");
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // --- Handlers: Image Processing ---
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setStatus('正在優化照片尺寸...');
      const compressed = await compressImage(file);
      setSourceImage(compressed);
      setStep(2);
      setStatus('');
    }
  };

  // --- Handlers: Camera ---
  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" }
      });
      setVideoStream(stream);
    } catch (err) {
      console.error("Camera access error:", err);
      alert("無法開啟相機，請確認您已允許相機權限，且使用 HTTPS 或 Localhost 環境。");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setIsCameraOpen(false);
  };

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // 鏡像翻轉
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      stopCamera();
      setSourceImage(imageUrl);
      setStep(2);
    }
  };

  // --- Helper: Text Merging ---
  const mergeTextToImage = (imageUrl, text) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(img, 0, 0, 1024, 1024);
        
        const fontSize = text.length > 5 ? 100 : 130;
        ctx.font = `900 ${fontSize}px "Noto Sans TC", "PingFang TC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 25;

        const x = 512;
        const y = 980;

        ctx.strokeStyle = 'white';
        ctx.strokeText(text, x, y);
        
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 8;
        ctx.strokeText(text, x, y);

        ctx.fillStyle = text.length > 4 ? '#FFD700' : 'white';
        ctx.fillText(text, x, y);
        
        resolve(canvas.toDataURL('image/png'));
      };
    });
  };

  // --- AI Generation ---
  const callAI = async (meme, retry = 0) => {
    if (!apiKey) {
      alert("請先設定 API Key 才能生成貼圖！");
      throw new Error("No API Key");
    }

    try {
      const actionPrompt = meme.isCustom
        ? `Make a funny, exaggerated facial expression that matches the emotion of saying "${meme.text}".` 
        : meme.mood;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `Create a digital LINE sticker. 
                Character: Person in photo. 
                Action/Mood: ${actionPrompt}. 
                Style: ${selectedStyle.prompt}. 
                IMPORTANT BACKGROUND RULE: The background MUST be pure solid #FFFFFF white. No gradients, no scenery. 
                The character must be isolated on white with a thick white sticker contour/border around them for easy cropping.
                NEGATIVE PROMPT: Do NOT include any text, speech bubbles, words, or letters in the generated image. The image should be illustration only. I will add text later programmatically.` },
              { inlineData: { mimeType: "image/jpeg", data: sourceImage.split(',')[1] } }
            ]
          }],
          generationConfig: { responseModalities: ['IMAGE'] }
        })
      });
      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0].content) {
         console.error("API Error Data:", data);
         throw new Error("AI 生成失敗，請檢查 API Key 或網路");
      }

      const rawUrl = `data:image/png;base64,${data.candidates[0].content.parts.find(p => p.inlineData).inlineData.data}`;
      return await mergeTextToImage(rawUrl, meme.text);
    } catch (e) {
      console.error(e);
      if (retry < 1) return callAI(meme, retry + 1); // 減少重試次數，避免卡住
      return null;
    }
  };

  const startGeneration = async () => {
    if (!apiKey) {
        alert("尚未設定 API Key，無法生成圖片。\n請在程式碼 src/App.jsx 中填入您的 Google Gemini API Key。");
        return;
    }

    setIsGenerating(true);
    setStep(3);
    
    let selectedMemes = [];
    const filteredDB = selectedCategory === 'all' 
      ? MEME_DATABASE 
      : MEME_DATABASE.filter(m => m.category === selectedCategory);
    const shuffledDB = [...filteredDB].sort(() => 0.5 - Math.random());

    let dbIndex = 0;
    selectedMemes = customTexts.map((text) => {
        if (text.trim()) {
            return { text: text.trim(), mood: "Custom Expression", isCustom: true };
        } else {
            const meme = shuffledDB[dbIndex % shuffledDB.length];
            dbIndex++;
            return meme;
        }
    });

    setStickers(selectedMemes.map(m => ({ ...m, loading: true })));

    for (let i = 0; i < selectedMemes.length; i++) {
      setStatus(`繪製中 (${i+1}/9): ${selectedMemes[i].text}`);
      const finalUrl = await callAI(selectedMemes[i]);
      
      setStickers(prev => {
        const next = [...prev];
        if (finalUrl) {
            next[i] = { ...next[i], loading: false, url: finalUrl };
        } else {
            // 如果失敗，顯示錯誤狀態
            next[i] = { ...next[i], loading: false, error: true };
        }
        return next;
      });
    }
    setIsGenerating(false);
    setStatus('生成完成！');
  };

  const downloadImg = (url, name) => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `STK_${name}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    setStatus('正在連續下載...');
    for (const s of stickers) {
      if (s.url) {
        downloadImg(s.url, s.text);
        await new Promise(r => setTimeout(r, 600));
      }
    }
    setStatus('全部下載完畢！');
  };

  const handleCustomTextChange = (index, value) => {
    const newTexts = [...customTexts];
    newTexts[index] = value;
    setCustomTexts(newTexts);
  };
  
  const clearCustomTexts = () => setCustomTexts(Array(9).fill(''));
  
  const fillRandomToGrid = () => {
    const filteredDB = selectedCategory === 'all' 
      ? MEME_DATABASE 
      : MEME_DATABASE.filter(m => m.category === selectedCategory);
    const shuffledDB = [...filteredDB].sort(() => 0.5 - Math.random());
    const newTexts = customTexts.map((text, i) => {
        return text ? text : shuffledDB[i % shuffledDB.length].text;
    });
    setCustomTexts(newTexts);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="px-5 h-16 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-2">
          {step > 1 && !isGenerating && (
            <button onClick={() => setStep(1)} className="p-1 -ml-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft /></button>
          )}
          <h1 className="text-xl font-black italic tracking-tighter bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
            STK-AI <span className="text-[10px] not-italic font-normal text-slate-400 border border-slate-600 px-1.5 rounded">PRO</span>
          </h1>
        </div>
        
        {/* User Profile / Login */}
        <div className="flex items-center gap-3">
          {user && !user.isAnonymous ? (
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-6 h-6 rounded-full" />
              <button onClick={handleLogout} className="text-xs text-slate-300 hover:text-white transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-full transition-all">
              <LogIn size={14} /> 登入
            </button>
          )}
          
          {step === 3 && !isGenerating && (
            <button onClick={downloadAll} className="hidden sm:flex bg-white text-black px-4 py-1.5 rounded-full text-xs font-black shadow-lg active:scale-95 transition-all hover:bg-indigo-50 items-center gap-1">
              <Download size={14}/> 儲存全部
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-5 overflow-y-auto w-full max-w-2xl mx-auto">
        {status && (
          <div className="mb-6 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-center text-xs font-bold text-indigo-300 animate-pulse flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin"/> {status}
          </div>
        )}

        {/* Step 1: Upload or Capture */}
        {step === 1 && (
          <div className="h-full flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-700 mt-10">
             
             {/* Upload / Camera Options */}
             <div className="flex flex-col gap-6 w-full max-w-sm">
                 
                 {/* 1. Upload File */}
                 <div 
                    onClick={() => fileInputRef.current.click()}
                    className="relative group cursor-pointer w-full aspect-square rounded-[3rem] bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-5 hover:border-indigo-500 hover:bg-slate-800/50 transition-all active:scale-95 shadow-2xl overflow-hidden"
                 >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"/>
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-slate-900 group-hover:scale-110 transition-transform duration-300 relative z-10">
                      <Upload size={36} className="text-white" />
                    </div>
                    <div className="text-center relative z-10">
                      <span className="block font-black text-xl mb-1 text-white">上傳照片</span>
                      <span className="text-xs text-slate-400">JPG / PNG</span>
                    </div>
                 </div>

                 {/* 2. Open Camera Button */}
                 <button 
                    onClick={startCamera}
                    className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center gap-3 text-white font-bold transition-all active:scale-95 shadow-lg"
                 >
                    <Camera size={20} /> 開啟相機自拍
                 </button>

                 <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
             </div>
             
             <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                   <Grid size={20} className="text-indigo-400"/>
                   <span className="text-xs font-bold text-slate-300">150+ 分類語錄</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                   <Type size={20} className="text-purple-400"/>
                   <span className="text-xs font-bold text-slate-300">9 格自訂填空</span>
                </div>
             </div>
          </div>
        )}

        {/* Step 2: Settings */}
        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right duration-400 pb-20">
            {/* Image Preview */}
            <div className="flex justify-center">
               <div className="w-32 h-32 rounded-[2rem] overflow-hidden ring-4 ring-slate-700 shadow-2xl relative group bg-black">
                 <img src={sourceImage} className="w-full h-full object-cover" alt="Preview" />
                 <button 
                  onClick={() => setStep(1)}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
                 >
                   <span className="text-xs font-bold text-white border border-white/30 px-3 py-1 rounded-full">重拍/重選</span>
                 </button>
               </div>
            </div>

            {/* Category Selection */}
            <section className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-4 shadow-xl">
               <div className="flex items-center justify-between">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Grid size={14} /> 語錄主題
                 </label>
               </div>
               <div className="grid grid-cols-3 gap-2">
                 <button 
                    onClick={() => setSelectedCategory('all')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${selectedCategory === 'all' ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                 >
                    全部混搭
                 </button>
                 {Object.values(CATEGORIES).map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${selectedCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
                    >
                       <cat.icon size={14} />
                       {cat.name}
                    </button>
                 ))}
               </div>
            </section>

            {/* Custom Text Grid */}
            <section className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                 <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Type size={14} /> 貼圖文字 (9格)
                 </label>
                 <div className="flex gap-2">
                     <button onClick={fillRandomToGrid} className="text-[10px] px-2 py-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition-colors border border-slate-700">
                        <Wand2 size={10}/> 填滿
                     </button>
                     {customTexts.some(t => t) && (
                        <button onClick={clearCustomTexts} className="text-[10px] px-2 py-1 bg-red-500/10 rounded hover:bg-red-500/20 text-red-400 flex items-center gap-1 transition-colors border border-red-500/20">
                            <Eraser size={10}/> 清空
                        </button>
                     )}
                 </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {customTexts.map((text, index) => (
                    <input 
                      key={index}
                      type="text" 
                      value={text}
                      onChange={(e) => handleCustomTextChange(index, e.target.value)}
                      placeholder={`#${index + 1}`}
                      maxLength={8}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2 py-3 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-center"
                    />
                ))}
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                 輸入自訂文字，空白處將自動補滿。
              </p>
            </section>

            {/* Style Selection */}
            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">選擇畫風</h3>
              <div className="grid grid-cols-1 gap-3">
                {STYLES.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setSelectedStyle(s)}
                    className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all group relative overflow-hidden ${selectedStyle.id === s.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900 hover:bg-slate-800'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedStyle.id === s.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                      <Sparkles size={18} />
                    </div>
                    <div className="text-left z-10">
                       <span className={`block font-bold text-base ${selectedStyle.id === s.id ? 'text-white' : 'text-slate-300'}`}>{s.name}</span>
                       <span className="text-[10px] text-slate-500">{s.id === 'manga' ? '黑白高對比' : s.id === 'line-sticker' ? '粗線條 Q 版' : 'AI 藝術渲染'}</span>
                    </div>
                    {selectedStyle.id === s.id && <Check className="ml-auto text-indigo-500" size={20} />}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="grid grid-cols-3 gap-3 animate-in slide-in-from-bottom duration-500 pb-20">
            {stickers.map((s, i) => (
              <div key={i} className="aspect-square bg-white rounded-[1.5rem] border border-slate-200 overflow-hidden relative group shadow-lg">
                {s.loading ? (
                  <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-2 p-2 text-center">
                    <RefreshCw size={24} className="animate-spin text-indigo-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Generating</span>
                  </div>
                ) : s.error ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 gap-2">
                      <AlertCircle size={24} className="text-red-500" />
                      <span className="text-[10px] text-red-400">失敗</span>
                   </div>
                ) : s.url ? (
                  <div className="relative h-full w-full animate-in zoom-in duration-400 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                     <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px]"></div>
                    <img src={s.url} alt={s.text} className="w-full h-full object-contain relative z-10" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px] z-20">
                      <button 
                        onClick={() => downloadImg(s.url, s.text)} 
                        className="bg-white text-black p-3 rounded-full hover:scale-110 active:scale-95 transition-all shadow-xl"
                      >
                        <Save size={20}/>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Camera Modal Overlay */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="relative flex-1 bg-black">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                />
                <button 
                    onClick={stopCamera} 
                    className="absolute top-5 right-5 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 z-50"
                >
                    <X size={24} />
                </button>
            </div>
            <div className="h-32 bg-slate-900 flex items-center justify-center gap-8 pb-5">
                <button 
                    onClick={capturePhoto} 
                    className="w-20 h-20 rounded-full bg-white border-4 border-slate-300 active:scale-95 active:bg-slate-200 transition-all ring-4 ring-indigo-500/30 shadow-2xl"
                />
            </div>
            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Footer */}
      <footer className="p-5 bg-slate-900/90 backdrop-blur-2xl border-t border-slate-800 fixed bottom-0 w-full z-40">
         <div className="max-w-2xl mx-auto">
            {step === 2 && (
            <button 
                onClick={startGeneration}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-14 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 hover:brightness-110"
            >
                <Sparkles size={20} />
                {customTexts.some(t => t) ? '生成混合貼圖' : `生成 9 張 (${selectedCategory === 'all' ? '隨機' : Object.values(CATEGORIES).find(c => c.id === selectedCategory)?.name})`}
            </button>
            )}
            {step === 3 && (
            <div className="flex gap-3">
                <button 
                    disabled={isGenerating}
                    onClick={() => { setStep(2); setStickers([]); setStatus(''); }}
                    className="flex-1 bg-slate-800 text-slate-300 h-14 rounded-2xl font-bold border border-slate-700 active:bg-slate-700 transition-all disabled:opacity-50"
                >
                    {isGenerating ? '繪製中...' : '返回重設'}
                </button>
                {!isGenerating && (
                    <button 
                    onClick={downloadAll}
                    className="flex-[1.5] bg-indigo-600 text-white h-14 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-indigo-500"
                    >
                    <Download size={20} /> 儲存全部
                    </button>
                )}
            </div>
            )}
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@900&display=swap');
        ::-webkit-scrollbar { width: 0px; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default App;
