import requests
from concurrent.futures import ThreadPoolExecutor
from pprint import pprint

url ='https://timetable.nctu.edu.tw/'


class form_builder:
  def __init__(self):
    pass

  @staticmethod
  def fetch_acysem():
    '''回傳一系列可供查詢的acysem
    ex. [ '1071', '106X', '1062', '1061', ...]

    acy(學年);
    sem(學期)->(1:上,2:下,X:暑)
    '''
    para={ "r":"main/get_acysem"}
    response = requests.post(url,params=para).json()

    result = []
    for li in response:
      result.append(li['T'])
    return result

  @staticmethod
  def fetch_category(acy_sem,ftype):
    '''Depend on acysem
    ftype is one of 
    "3" -> "學士班課程"    
    "2" -> "研究所課程"      
    "0" -> "學士班共同課程"  
    "7" -> "其他課程"    
    "72"-> "學分學程"    
    "9" -> "跨領域學程"   
    "8" -> "教育學程"
    acysem:
      "1061" -> 106
      "1062" -> 106下
      "106X" -> 106暑
    '''
    para={ "r":"main/get_category"}
    data={'ftype':ftype, 'flang':'zh-tw', 'acysem':acy_sem  }
    response = requests.post(url,params=para, data=data).json()
    if response != []:
      #大部分情況
      if type(response) is dict: 
        result = list( response.keys())
        return result

      # type 屬於 其他課程,學分學程,跨領域學程,教育學程的情況下
      # 後端會回傳一堆重複的物件(wtf???)，必須要自行合併
      elif type(response) is list:
        cat_dict = dict()
        for obj in  response:
          if cat_dict.get(obj['unit_id']) is None:
            cat_dict[obj['unit_id']] = obj['unit_name']

        return list( cat_dict.keys())

    return []

  @staticmethod
  def fetch_college(ftype, fcategory):
    '''Depend on type,category
    '''
    para={"r":"main/get_college"}
    data={'ftype':ftype, 'flang':'zh-tw',
        'fcategory':fcategory}
    response = requests.post(url, params=para, data=data).json()
    #使用dict而不是list只是為了方便除蟲
    result_dict = {}
    for data in response:
      result_dict[data['CollegeNo']] = data['CollegeName']

    return list(result_dict.keys())

  @staticmethod
  def fetch_department(acysem,ftype,fcategory,fcollege):
    '''acysem,type,cat,college
    '''

    # depend on collcge, acysem
    para={'r':'main/get_dep'}
    data={'acysem':acysem,'ftype':ftype,
        'fcategory':fcategory,'fcollege':fcollege,'flang':'zh-tw'}
    response = requests.post(url, params=para, data=data).json()

    if response != []:
      #大部分情況
      if type(response) is dict: 
        result = list( response.keys())
        return result

      # type 屬於 其他課程,學分學程,跨領域學程,教育學程的情況下
      # 後端會回傳一堆重複的物件(wtf???)，必須要自行合併
      elif type(response) is list:
        cat_dict = dict()
        for obj in  response:
          if cat_dict.get(obj['unit_id']) is None:
            cat_dict[obj['unit_id']] = obj['unit_name']
        return list( cat_dict.keys())

    return []
    
  
def fetch_course_list(acy_sem="", dep=""):
  form=dict()
  form_keys= [
    "m_acy",    "m_sem",       "m_degree",
    "m_dep_id", "m_group",     "m_grade",
    "m_class",  "m_option",    "m_crsname",
    "m_teaname","m_cos_id",    "m_cos_code",
    "m_crstime","m_crsoutline","m_costype"
  ]
  for i in form_keys:
    form[i] = "**"
  
  if len(acy_sem) != 0:
    #print(f'acysem: {acy_sem}')
    form['m_acy'] = str(acy_sem[:-1])
    form['m_sem'] = str(acy_sem[-1])
  
  if len(dep)!= 0:
    #print(f'consturct dep:{dep}')
    form['m_degree'] = str(dep[0])
    form['m_dep_id'] = str(dep[1:])


  para={ "r":"main/get_cos_list"}
  #print(f'url:{url}, para:{para}, data:{form}')

  dep_results= []
  course_dict = {}#紀錄所有出現過的課程(使用{學年}_{當期課號}當作標籤 )e.g. "1071_1609"
  # parse result into list of course infomations
  response = requests.post(url,params=para,data=form).json()
  if response == []:
    return []
  for k,v in response.items():
    # 後端回傳的是以開課單位為鍵值的課程列表
    dep_results.append( {k:v} )
  if dep_results == []:
    print(f'coslist is empty')
    return []
  
  #print(f"len :{len(dep_results)}")

  def register_courses(course_list):
    '''從原始資料中擷取出有用的課程資訊並註冊到 course_dict
    '''
    nonlocal course_dict
    course_list = list(course_list.items())

    for course_id, content in course_list:
      #只有發現課程沒有紀錄的情況下才需要紀錄
      if course_dict.get(course_id) is None:
        course_dict[course_id] = content
      #else:
      #  dc = course['cos_id']
      #  print(f'重複課程{ dc}')

  # 註冊課程
  for c in dep_results:
    c = list(c.values())[0]
    #pprint(c)

    if c.get('1')!= None:
      register_courses( c['1'])
    
    # 相關課程列表，不一定會出現
    if c.get('2')!= None:
      register_courses( c['2'])


    # 對已註冊課程補充額外欄位資訊
    # 通識類別  brief
    # brief 欄位會列出所有出現過課程的brief欄位
    for cid, content in c['brief'].items():
      # brief有時候會是空白，不過沒差
      brief = list(content.values())[0]['brief']
      course_dict[cid]['brief'] = brief

    # 進階通認識類別 (個別學院承認可以當作通識的課程)(N+沒有)

    # 授課語言代碼(N+沒有)
    for cid, content in c['language'].items():
      language = content['授課語言代碼']
      course_dict[cid]['language'] = language
  
  #result = list(course_dict.values())
  result = course_dict
  return result

def fetch_mapper(arg_tuple):
  tu = arg_tuple
  result = fetch_course_list(acy_sem=tu[0], dep=tu[1])
  #print('returned!')
  return result

def dfs_courses(acysem):
  '''回傳需要query所有系所資訊的query string list
    (建立於特定學期)
  '''
  facysem = acysem
  result = []

  valid_type_list = {
    "3": "學士班課程",
    "2":"研究所課程",
    "0":"學士班共同課程",
    "7":"其他課程",
    "72":"學分學程",
    "9":"跨領域學程",
    "8":"教育學程",
  }
  q = form_builder()
  for ftype in list(valid_type_list.keys()):
    categories = q.fetch_category(facysem, ftype)
    #print(f'category:{categories}')
    #print('=='*20)

    if len(categories) == 0:
      categories = [""]
    for fcategory in categories:
      # 只有ftype為 '3'or'2' 的時候才需要 fetch college
      if ftype in ["3","2"]:
        colleges = q.fetch_college(ftype,fcategory)
        #print(f'college {college}')
        #print('=='*20)
        if len(colleges) == 0:
          colleges = [""]  
        for fcollege in colleges:
          deps = q.fetch_department(facysem,ftype,fcategory,fcollege)
          #print(f'department:{dep}')
          #print('=='*20)
          for fdep in deps:
            result.append({
              'facysem': facysem,
              'fdep':fdep
            })
  return result

def main():

  # "343" -> 一般學士班:外文系
  # "353" -> 一般學士班:人社系

  # "0U9" -> 學士班共同課程:體育 
  # "0U5" -> 學士班共同課程:校共同:通識  (回傳的是多個學院開的課)


  #result = fetch_course_list(acy_sem="1071", dep="343")
  #print(result)




  q = form_builder()

  acysem = q.fetch_acysem()
  # acysem:['1071', '106X', '1062',...]
  print(f'acysem:{acysem}')
  print('=='*20)
  qs = dfs_courses("1071")  


  courses = dict()
  arg_tuples = [ (d['facysem'], d['fdep']) for d in qs ]
  with ThreadPoolExecutor(max_workers=100) as executor:
    results = executor.map(fetch_mapper, arg_tuples )
    for r in results:
      courses.update(r)

  print(f'total courses:{len(courses)}')



  #qs.sort(key= lambda x:x['fdep'])
  #for i in qs:
  #  print(i)

if __name__ == "__main__":
  main()
