import requests
from pprint import pprint

url ='https://timetable.nctu.edu.tw/'

class query:
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

def main():
  q = query({"m_acy":106, "m_sem":2, "m_degree":0,"m_dep_id":'U9' })
  pprint(q.start())

if __name__ == "__main__":
  main()