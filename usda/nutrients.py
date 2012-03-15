import os
import csv
import json

from urllib2 import urlopen

sources = {
    'food_groups': 'data/FD_GROUP.txt',
    'food': 'data/FOOD_DES.txt',
    'nutrients': 'data/NUTR_DEF.txt',
    'weights': 'data/WEIGHT.txt',
    #'footnotes': 'data/FOOTNOTE.txt',
    #'langdesc': 'data/LANGDESC.txt',
    'data': 'data/NUT_DATA.txt',
}

data = {}
nutrients = {}
foods = {}
_foods = []
foodgroups = {}
_foodgroups = []

for k,v in sources.iteritems():
    source = csv.reader(open(v, 'rb'), delimiter='^', quotechar='~')
    data[k] = []
    for i in source:
        data[k].append(i)

# Nutrients
"""
for nut in data['nutrients']:
    nutrients[nut[0]] = {
        'name': nut[3],
        'tagname': nut[2],
        'unit': nut[1],
    }
"""

# Food Groups
for group in data['food_groups']:
    foodgroups[group[0]] = {
        'name': group[1],
        'foods': [],
    }
    _foodgroups.append({
        'id': group[0],
        'name': group[1],
        'foods': [],
    })

# Food
for food in data['food']:
    foods[food[0]] = {
        'name': food[2],
        'foodgroup':food[1],
        'nutrients':[],
    }
    _foods.append({
        'id': food[0],
        'name': food[2],
        'foodgroup':food[1],
        'nutrients':[],
    })

# Nutrients
for item in data['data']:
    amount = float(item[2])
    if amount > 0.001:
        nut = {
            'id': item[1],
            'amount': amount,
        }
        foods[item[0]]['nutrients'].append(nut)

# Group Foods by Group
for food in _foods:
    value = 0;
    for nut in foods[food['id']]['nutrients']:
        value += nut['amount']
    foodgroups[food['foodgroup']]['foods'].append({
        'id': food['id'],
        'name': food['name'],
        'nutrients': foods[food['id']]['nutrients'],
        'value':value,
    })


# Bitdeli data import
BITDELI_INPUT = "i-04bb3fe3b92b1b-e31198a8"
BITDELI_URL = "https://in.bitdeli.com/events/%s" % BITDELI_INPUT
BITDELI_AUTH = os.environ['BITDELI_AUTH']

def send_to_bitdeli(item, group_key):
    event = json.dumps({'auth': BITDELI_AUTH,
                        'group_key': group_key,
                        'object': item})
    print urlopen(BITDELI_URL, event).read()

# Send all data
for group in _foodgroups:
    for food in foodgroups[group['id']]['foods']:
        send_to_bitdeli(food, group['id'])
