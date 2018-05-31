import requests
from pprint import pprint

import default
url ='https://timetable.nctu.edu.tw/'


class query:
  _acysem = None
  _default_lang = "zh-tw"
  def __init__(self,kwargs):
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
    if len(kwargs) != 0:
      for k,v in kwargs.items():
        if k in self.form.keys():
          self.form[k] = v
 

  def start(self):
    para={ "r":"main/get_cos_list"}
    return requests.post(url,params=para,data=self.form).json()

  def fetch_acysem(self):
    para={ "r":"main/get_acysem"}
    response = requests.post(url,params=para).json()
    out = dict()
    # gather semesters by academic year
    for li in response:
      v = li['T']
      year = v[:-1]
      if year in out:
        out[year].append(v[-1])
      else:
        out[year] = list(v[-1])
    _acysem = out
    return response

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
    self._category = { v:k for k,v in response.items()}
    return response

  def fetch_college(self, ftype, fcategory):
    '''Depend on type,category
    '''
    para={"r":"main/get_college"}
    data={'ftype':ftype, 'flang':'zh-tw',
        'fcategory':fcategory}
    response = requests.post(url, params=para, data=data).json()
    self._college = { li['CollegeNo']:li['CollegeName'] for li in response}
    return response

  def fetch_department(self,acysem,ftype,fcategoery,fcollege):
    '''acysem,type,cat,college
    '''

    # depend on collcge, acysem
    para={'r':'main/get_dep'}
    data={'acysem':acysem,'ftype':ftype,
        'fcategory':fcategoery,'fcollege':fcollege,'flang':'zh-tw'}
    response = requests.post(url, params=para, data=data).json()
    self._department = {
        li['unit_name']:{
          'degree':li['unit_id'][:1],
          'dep_id':li['unit_id'][1:]
        } for li in response
      }
    #print(self._department)
    return response
    

def main():
  #q = query({"m_acy":106, "m_sem":2, "m_degree":0,"m_dep_id":'U9' })
  #q.start()
  #pprint(q.fetch_acysem_list())
  q = query({})
  acysem = q.fetch_acysem();
  print(f'acysem:#{acysem}')
  print('=='*20)


  valid_type_list = {
    "學士班課程":"3",
    "研究所課程":"2",
    "學士班共同課程":"0",
    "其他課程":"7",
    "學分學程":"72",
    "跨領域學程":"9",
    "教育學程":"8",
  }
  ftype = "3"
  facysem = "1071"
  category = q.fetch_category(facysem, ftype)
  print(f'category:#{category}')
  print('=='*20)
  

  # cat ='3*'  一般學士班
  fcategory = "3*"
  college = q.fetch_college(ftype,fcategory)
  print(f'college #{college}')
  print('=='*20)

  fcollege = "C"
  dep = q.fetch_department("1071",ftype,fcategory,fcollege)
  print(dep)
  print('=='*20)

  f_dep = "317" #還不是正式可以使用的欄位
  fdegree = f_dep[0]
  fdep_id = f_dep[1:]



  #詢問完所有欄位後就可以發出請求
  {"m_acy":106, "m_sem":2, "m_degree":0,"m_dep_id":'U9' }
  q = query({"m_acy":facysem[:-1], "m_sem":facysem[-1], "m_degree":fdegree,"m_dep_id":fdep_id })
  result = q.start()
  print(f"result:#{result}")

if __name__ == "__main__":
  main()
