import pandas

def get_range():
    return ["0.0", "0.05", "0.25", "0.5", "0.75", "1.0", "1.25", "1.5", "1.75", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0", "6.0", "7.0", "8.0",	"10.0"]
					

def get_data(column_name: str, filename: str, number: float):

    filepath = f"C:/Users/madsr/Documents/code/tun_bachelor/data/{filename}.csv"

    df = pandas.read_csv(filepath)

    column = f"{column_name}{number}"

    print("Searching for:", column)

    if column not in df.columns:
        print("NOT FOUND")
        return {
            "error": f"Column '{column}' not found",
            "available_columns": df.columns.tolist()
        }

    return df[column].to_dict()