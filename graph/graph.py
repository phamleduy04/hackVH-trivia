import matplotlib.pyplot as plt
import argparse
import json
from matplotlib.ticker import MaxNLocator

parser = argparse.ArgumentParser()
parser.add_argument('-i', type = str, dest='id')
args = parser.parse_args()
id = args.id

ax = [
  plt.subplot2grid((2, 2), (0, 0), colspan = 2),
  plt.subplot2grid((2, 2), (1, 0), colspan = 2)
]

if (id is None):
    print('No ID!')
    quit()

try:
    with open(f'data/{id}.json') as userdata:
        data = json.load(userdata)

        ax[0].plot(list(range(1, 11)), data['lastTenTimes'])
        ax[0].set(title="Last 10 times", xlabel="Times played", ylabel="Points", xlim=(1, 10))
        ax[0].legend(['Points'],loc="best")
        ax[0].grid(axis='both', color='0.95')

        ax[1].plot(list(range(0, len(data['userPerformance']))), data['userPerformance'])
        ax[1].set(title="All time", xlabel="Times played", ylabel="Points", xlim=(1,len(data['userPerformance'])))
        ax[1].legend(['Points'],loc="best")
        ax[1].grid(axis='both', color='0.95')
        ax[1].xaxis.set_major_locator(MaxNLocator(integer=True))

except (FileNotFoundError):
    quit()

plt.tight_layout()
plt.savefig(f'images/{id}.jpg')