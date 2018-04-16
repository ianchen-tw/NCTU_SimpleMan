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

    self.play_load=dict()
    form_keys= ["m_acy","m_sem","m_degree","m_dep_id","m_group","m_grade",
    "m_class","m_option","m_crsname","m_teaname","m_cos_id","m_cos_code",
    "m_crstime","m_crsoutline","m_costype"]
    for i in form_keys:
      self.play_load[i] = "**"
    if len(kwargs) != 0:
      for k,v in kwargs.items():
        if k in self.play_load.keys():
          self.play_load[k] = v

  def expand(self):
    pass

  def start(self):
    para={ "r":"main/get_cos_list"}
    return requests.post(url,params=para,data=self.play_load).json()

  def fetch_acysem_list(self):
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
    return

  def fetch_category(self):
    '''Depend on acysem
    '''
    para={ "r":"main/get_category"}
    data={'ftype':default.category['研究所課程'], 'flang':'zh-tw', 'acysem':'1061'  }
    response = requests.post(url,params=para, data=data).json()
    self._category = { v:k for k,v in response.items()}
    return

  def fetch_college(self):
    '''Depend on category
    '''
    if self._category is None:
      self.fetch_category()

    first_element = self._category[list(self._category.keys())[0]]

    para={"r":"main/get_college"}
    data={'ftype':default.category['研究所課程'], 'flang':'zh-tw',
        'fcategory':first_element}
    response = requests.post(url, params=para, data=data).json()
    self._college = { li['CollegeNo']:li['CollegeName'] for li in response}
    return

  def fetch_department(self):
    # depend on collcge, acysem
    if self._college is None:
      self.fetch_college()
    para={'r':'main/get_dep'}
    data={'acysem':'1061','ftype':default.category['研究所課程'],
        'fcategory':'2*','fcollege':'A','flang':'zh-tw'}
    response = requests.post(url, params=para, data=data).json()
    self._department = { li['unit_name']:li['unit_id'] for li in response}
    print(self._department)
    return
    

def main():
  q = query({"m_acy":106, "m_sem":2, "m_degree":0,"m_dep_id":'U9' })
  q.fetch_department()
  #pprint(q.fetch_acysem_list())

if __name__ == "__main__":
  main()
