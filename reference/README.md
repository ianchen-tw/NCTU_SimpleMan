# 用途
解析學校課程時間表的原始碼

## 變數名稱
+ acy: academic year 半學年( 1:上學期,2:下學期, 3:暑期)
+ sem: semester 學期 ( 106,105,104, ... )
+ degree:  
+ dep_id: 開課系所( 資訊工程學系)
+ group: 組別(資訊工程組) 
+ grade: 年級(大三)
+ class: 班級(B班)
+ option
+ crstime: course time 特定時段
+ crsoutline
+ costype

## 規則
type, category, college, dep 這些欄位並不一定會全部出現，會依據目前所選取的大項目而有所變動

e.g.

學士班外文系課程:
  + type: 學士班課程
  + category: 一般學士班
  + college: 人文社會學院
  + dep: 外國語文學系

通識課程:
  + type: 學士班共同課程
  + category: 學士班共同課程
  + dep: 通識 


