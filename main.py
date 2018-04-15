import requests
from pprint import pprint

url ='https://timetable.nctu.edu.tw/'
para={ "r":"main/get_cos_list"}

form_keys= ["m_acy","m_sem","m_degree","m_dep_id","m_group","m_grade","m_class","m_option","m_crsname","m_teaname","m_cos_id","m_cos_code","m_crstime","m_crsoutline","m_costype"]

play_load={}
for i in form_keys:
  play_load[i] = "**"

play_load['m_acy'] = 106
play_load['m_sem'] = 2
play_load['m_degree'] = 3
play_load['m_dep_id'] = 43

r = requests.post(url,params=para,data=play_load)
pprint(r.json())
