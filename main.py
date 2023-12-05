import pandas as pd
import numpy as np


def drop_first_x_cols(df, num_cols):
    return df.iloc[:, num_cols:]

# def adjust_points(df, theme, threshold, max_attempts):
#     def manhattan_distance(row1, row2):
#         return abs(row1['x'] - row2['x']) + abs(row1['y'] - row2['y'])
#
#     attempts = 0
#     while attempts < max_attempts:
#         subset = df[df['theme_name'] == theme]
#         pairs_to_adjust = []
#
#         # Identify pairs that need adjustment
#         for i, row1 in subset.iterrows():
#             for j, row2 in subset.iterrows():
#                 if i < j and manhattan_distance(row1, row2) <= threshold:
#                     pairs_to_adjust.append((i, j))
#
#         # Report the number of pairs identified
#         print(f"Attempt {attempts + 1}: {len(pairs_to_adjust)} pairs identified")
#
#         # Adjust points
#         for i, j in pairs_to_adjust:
#             # Randomly choose a point to adjust
#             point_to_adjust = i if np.random.random() > 0.5 else j
#             # Shift the point slightly
#             df.at[point_to_adjust, 'x'] += np.random.uniform(-2, 2)
#             df.at[point_to_adjust, 'y'] += np.random.uniform(-2, 2)
#
#         attempts += 1
#
#     return df

def adjust_points(df, theme, threshold, max_attempts):
    def manhattan_distance(row1, row2):
        return abs(row1['x'] - row2['x']) + abs(row1['y'] - row2['y'])

    attempts = 0
    while attempts < max_attempts:
        subset = df[df['theme_name'] == theme]
        pairs_to_adjust = []

        # Store distances to avoid recalculating
        distances = {}

        # Identify pairs that need adjustment
        for i, row1 in subset.iterrows():
            for j, row2 in subset.iterrows():
                if i < j:
                    dist_key = (i, j)
                    if dist_key not in distances:
                        distances[dist_key] = manhattan_distance(row1, row2)
                    if distances[dist_key] <= threshold:
                        pairs_to_adjust.append(dist_key)

        # Report the number of pairs identified
        print(f"Attempt {attempts + 1}: {len(pairs_to_adjust)} pairs identified")

        # Collect adjustments to apply in bulk
        adjustments = {}

        # Adjust points
        for i, j in pairs_to_adjust:
            point_to_adjust = i if np.random.random() > 0.5 else j
            adjustment_x = np.random.uniform(-2, 2)
            adjustment_y = np.random.uniform(-2, 2)
            adjustments[point_to_adjust] = (adjustment_x, adjustment_y)

        # Apply adjustments
        for point, (adj_x, adj_y) in adjustments.items():
            df.at[point, 'x'] += adj_x
            df.at[point, 'y'] += adj_y
            # Update distances for the adjusted point
            for other_point in subset.index:
                if other_point != point:
                    dist_key = tuple(sorted([point, other_point]))
                    row1 = df.loc[point]
                    row2 = df.loc[other_point]
                    distances[dist_key] = manhattan_distance(row1, row2)

        attempts += 1

    return df

def print_hi(name):
    # Use a breakpoint in the code line below to debug your script.
    print(f'Hi, {name}')  # Press Ctrl+F8 to toggle the breakpoint.


# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    print_hi('PyCharm')

    version = 22

    # Load your dataset
    file_path = f"data/hexagon_data_with_coordinates_v{version}.csv"  # Replace with your file path
    df = pd.read_csv(file_path)

    # Adjust points in the dataset
    adjusted_df = adjust_points(df, 'Star Wars', 7, 75)
    # adjusted_df = adjust_points(adjusted_df, 'Ninjago', 7, 75)
    # adjusted_df = adjust_points(adjusted_df, 'Friends', 7, 75)

    # adjusted_df = drop_first_x_cols(df, 2)

    # Save the adjusted dataset -> Replace with your desired file path
    adjusted_df.to_csv(f"data/hexagon_data_with_coordinates_v{version + 1}.csv", index=False)  # index=True when first col. in CSV is the index

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
