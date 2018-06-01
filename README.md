# NCTU SimpleMan

交大課程時間表的爬蟲

不使用難用的UI介面，而是選擇當個簡單、直白的人。

```
"Be a simple, kind of man. Be something, you love and understand."
    - Simple Man, Lynyrd Skynyrd.
```

## 相依性

##### requests
`pip install requests`

## 使用方法

建議使用pythn3.6

`python3 main.py {學期}`
課程會儲存在 ./course 資料夾下
學期是 1071, 1062, 106X,... 其中之一

## Notice

1. 無法爬到的課程
    - 教學實務
    - 清華大學開的課程

2. 課程的brief欄位包含新制通識的欄位

 辨別的方法為類別後面會標記該方法通過校務會議的年份
e.g. 
 "文化/進階(96),跨院基本素養(106),校基本素養(106)"
 "體育必修(87)"