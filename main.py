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
      print(f'acysem: {acy_sem}')
      self.form['m_acy'] = str(acy_sem[:-1])
      self.form['m_sem'] = str(acy_sem[-1])
    
    if len(dep)!= 0:
      self.form['m_degree'] = str(dep[0])
      self.form['m_dep_id'] = str(dep[1:])
      


  def start(self):
    para={ "r":"main/get_cos_list"}
    return requests.post(url,params=para,data=self.form).json()

  def fetch_acysem(self):
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

  def fetch_category(self, acy_sem,ftype):
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

  def fetch_college(self, ftype, fcategory):
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

  def fetch_department(self,acysem,ftype,fcategoery,fcollege):
    '''acysem,type,cat,college
    '''

    # depend on collcge, acysem
    para={'r':'main/get_dep'}
    data={'acysem':acysem,'ftype':ftype,
        'fcategory':fcategoery,'fcollege':fcollege,'flang':'zh-tw'}
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
    

def main():

  q = query({})

  acysem = q.fetch_acysem()
  # acysem:['1071', '106X', '1062',...]
  print(f'acysem:{acysem}')
  print('=='*20)


  valid_type_list = {
    "3": "學士班課程",
    "2":"研究所課程",
    "0":"學士班共同課程",
    "7":"其他課程",
    "72":"學分學程",
    "9":"跨領域學程",
    "8":"教育學程",
  }
  ftype = list(valid_type_list.keys())[0]
  #4
  facysem = acysem[0]

  categories = q.fetch_category(facysem, ftype)
  print(f'category:{categories}')
  print('=='*20)
  

  
  # fetch college
  if len(categories) != 0:
    fcategory = categories[0]
  else:
    fcategory = ""
  college = []
  if ftype in ["3","2"]:
    college = q.fetch_college(ftype,fcategory)
    print(f'college {college}')
    print('=='*20)

  if len(college) != 0:
    fcollege = college[0]
  else:
    fcollege = ""

  dep = q.fetch_department(facysem,ftype,fcategory,fcollege)
  print(f'department:{dep}')
  print('=='*20)

  f_dep = "317" #還不是正式可以使用的欄位
  #q = query(acy_sem=facysem, dep=f_dep)
  #result = q.start()
  #print(f"result:#{result}")

if __name__ == "__main__":
  main()
