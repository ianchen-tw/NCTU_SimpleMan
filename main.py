import requests

from pprint import pprint

url ='https://timetable.nctu.edu.tw/'


class query:
  _acysem = None
  _default_lang = "zh-tw"
  def __init__(self,acy_sem="", dep=""):
    '''
    acy : academic year
    sem : semester
    degree:
    dep_id: department id
    group:
    grade:
    class:
    '''
    self._category = None
    self._college = None
    self._department = None
    self.form=dict()

    form_keys= [
      "m_acy",    "m_sem",       "m_degree",
      "m_dep_id", "m_group",     "m_grade",
      "m_class",  "m_option",    "m_crsname",
      "m_teaname","m_cos_id",    "m_cos_code",
      "m_crstime","m_crsoutline","m_costype"
    ]

    for i in form_keys:
      self.form[i] = "**"
    
    if len(acy_sem) != 0:
      #print(f'acysem: {acy_sem}')
      self.form['m_acy'] = str(acy_sem[:-1])
      self.form['m_sem'] = str(acy_sem[-1])
    
    if len(dep)!= 0:
      #print(f'consturct dep:{dep}')
      self.form['m_degree'] = str(dep[0])
      self.form['m_dep_id'] = str(dep[1:])

  def start(self):
    para={ "r":"main/get_cos_list"}
    #print(f'url:{url}, para:{para}, data:{self.form}')

    # parse result into list of course infomations
    cos_list = requests.post(url,params=para,data=self.form).json()
    if cos_list == []:
      print(f'coslist is empty')
      return []
    return requests.post(url,params=para,data=self.form).json()

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
  q = query()
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
  q = query(acy_sem="1071", dep="5C1")
  result = q.start()
  print(f"result:{result}")
  exit(0)


  q = query({})

  acysem = q.fetch_acysem()
  # acysem:['1071', '106X', '1062',...]
  print(f'acysem:{acysem}')
  print('=='*20)
  qs = dfs_courses("1071")  
  qs.sort(key= lambda x:x['fdep'])
  for i in qs:
    print(i)

if __name__ == "__main__":
  main()
