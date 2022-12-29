import math

def validMGR(mgr):
    if len(mgr) != 8:
        return False
    elif not mgr.isdigit():
        return False
    return True
"""
# main
with open("mgr.txt", 'r') as file:
    lines = file.readlines()

checkpoints = []

for line in lines:
    checkpoints.append(line.strip().replace(' ', ''))



# Subpoints
n_checkpoints = len(checkpoints)
points = [checkpoints[0]]
pt_distances = []

for i in range(1, n_checkpoints):
    easting = int(checkpoints[i-1][:4])
    northing = int(checkpoints[i-1][4:])
    
    e_diff = int(checkpoints[i][:4]) - int(checkpoints[i-1][:4])
    n_diff = int(checkpoints[i][4:]) - int(checkpoints[i-1][4:])

    # 100m intervals
    dist = ((e_diff ** 2 + n_diff ** 2) ** 0.5) / 10

    if dist <= 1:
        points.append(checkpoints[i])
        pt_distances.append(dist*100)
        
    else:
        remainder = dist - int(dist)
        e_increment = e_diff / dist
        n_increment = n_diff / dist
        
        for j in range(int(dist)):
            easting += e_increment
            northing += n_increment

            points.append(str(int(easting)) + str(int(northing)))
            pt_distances.append(100)

        easting += remainder * e_increment
        northing += remainder * n_increment

        points.append(str(int(easting)) + str(int(northing)))
        pt_distances.append(int(remainder*100))

    """"""
    # 50m intervals
    dist = ((e_diff ** 2 + n_diff ** 2) ** 0.5) / 5

    if dist <= 1:
        points.append(checkpoints[i])
        pt_distances.append(dist*50)
        
    else:
        remainder = dist - int(dist)
        e_increment = e_diff / dist
        n_increment = n_diff / dist
        
        for j in range(int(dist)):
            easting += e_increment
            northing += n_increment

            points.append(str(int(easting)) + str(int(northing)))
            pt_distances.append(50)

        easting += remainder * e_increment
        northing += remainder * n_increment

        points.append(str(int(easting)) + str(int(northing)))
        pt_distances.append(int(remainder*50))
    """



# Azimuth only
with open("mgr.txt", 'r') as file:
    lines = file.readlines()

points = []

for line in lines:
    points.append(line.strip().replace(' ', ''))

# Azimuth calculator
start_mgrs = points[:-1]
end_mgrs = points[1:]

n = len(start_mgrs)
for i in range(n):
    if validMGR(start_mgrs[i]) and validMGR(end_mgrs[i]):
        startMGR = [int(start_mgrs[i][:4]), int(start_mgrs[i][4:])]
        endMGR = [int(end_mgrs[i][:4]), int(end_mgrs[i][4:])]

        x_diff = endMGR[0] - startMGR[0]
        y_diff = endMGR[1] - startMGR[1]

        if x_diff == 0: # vertical
            if y_diff > 0: # upwards
                azimuth = 6400
            else: # downwards
                azimuth = 3200

        else:
            angle = math.atan(y_diff / x_diff)

            if x_diff > 0: # 1st & 4th quadrant
                azimuth = 1600 - (angle / (2 * math.pi) * 6400)
            else: # 2nd & 3rd quadrant
                azimuth = 4800 - (angle / (2 * math.pi) * 6400)

        #print(i+1, start_mgrs[i], end_mgrs[i], round(azimuth), pt_distances[i])
        print(i+1, start_mgrs[i], end_mgrs[i], round(azimuth))