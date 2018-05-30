
category = {
    "學士班課程":"3",
    "研究所課程":"2",
    "學士班共同課程":"0",
    "其他課程":"7",
    "學分學程":"72",
    "跨領域學程":"9",
    "教育學程":"8",
}


# 紀錄子欄位的標籤型態
child_relaiton_table = {
    # type
    '學士班課程':'category',
    '研究所課程':'category',
    '學士班共同課程':'category',
    '其他課程':'dep',
    '學分學程':'dep',
    '跨領域學程':'dep',
    '教育學程':None,

    #category
      # type = 學士班課程
    '一般學士班': 'college',
      # type = 研究所課程
    'EMBA':'college',
    '在職專班':'college',
    '產業專班':'college',
    '碩(博)士學位學程':'college',
      # type = 學士班共同課程
    '學士班校共同課程':'dep',
    '橋接課程(可採計為通識)':None,
    '各學院必修課程':None,

    # college
      # type = 一般學士班
        # 全部皆為 dep
        "人文社會學院":'dep', "生物科技學院":'dep', "資訊學院":'dep',
        "工學院":'dep', "電機學院":'dep',"客家文化學院":'dep', "管理學院":'dep',
        "光電學院":'dep', "理學院":'dep', "電機與資訊學院":'dep', 
      # type = EMBA
    '管理學院':'dep',
      # type = 在職專班
        # 全部皆為dep 
      # type = 產業專班
        # 全部皆為dep
      # type = 碩(博)士學位學程
        # 全部皆為dep
}

class query_part:
  def __init__(self):
    pass

class dep_part(query_part):
  def __init__(self, dep_id=None, degree=None ):
    parent = None
    self.dep_id = dep_id
    self.degree = degree
  def __eq__(self):
    pass

class college_part(query_part):
  def __init__(self, collegeNo=None, collegeName=None):
    parent = None
    self.collegeNo = collegeNo
    self.collegeName = collegeName
  def __eq__(self):
    pass

