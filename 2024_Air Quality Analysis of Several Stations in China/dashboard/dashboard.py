import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import streamlit as st
import datetime


def load_data_handler():
    """
    Function ini bertujuan untuk membaca file all_df.csv, menambahkan
    kolom date_time, serta mengubah nama kolom Overall_AQI menjadi AQI.

    Parameter:
    - None

    Return:
    - df : Pandas DataFrame
    """
    try:
        df = pd.read_csv("data/all_df.csv", index_col = 0)
        df["date_time"] = pd.to_datetime(df[["year", "month", "day"]])
        df.rename(columns = {"Overall_AQI": "AQI"}, inplace = True)
        return df
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return None


def plot_air_quality_parameter_comparison_handler(filtered_df, selected_parameters):
    """
    Function ini bertujuan untuk membuat plot visualisasi perbandingan
    parameter kualitas udara.

    Parameter:
    - filtered_df         : Pandas DataFrame
    - selected_parameters : List parameter yang dipilih

    Return:
    - None
    """
    try:
        if filtered_df is None or filtered_df.empty:
            st.warning("There are no data to visualize!")
            return

        parameter_aggregate = {parameter: "mean" for parameter in selected_parameters}
        parameter_bystation = filtered_df.groupby("station").agg(parameter_aggregate).reset_index()

        fig, axes = plt.subplots(len(selected_parameters), 1, figsize = (12, 4 * len(selected_parameters)))
        if len(selected_parameters) == 1:
            axes = [axes]  

        colors = ["#22d3ee" if i == 0 else "#cffafe" for i in range(len(filtered_df["station"].unique()))]

        for index, parameter in enumerate(selected_parameters):
            sorted_data = parameter_bystation.sort_values(by = parameter)
            sns.barplot(
                y = "station",
                x = parameter,
                data = sorted_data,
                palette = colors,
                ax = axes[index]
            )
            axes[index].set_title(f"Comparison of {parameter}")
            axes[index].set_xlabel(parameter)
            axes[index].set_ylabel("Station")

        fig.tight_layout()
        st.pyplot(fig)
    except Exception as e:
        st.error(f"Terjadi error saat visualisasi data: {e}")


def plot_air_quality_based_on_time_handler(filtered_df, selected_parameters):
    """
    Function ini bertujuan untuk membuat plot visualisasi kualitas udara
    berdasarkan parameter.

    Parameter:
    - filtered_df         : Pandas DataFrame
    - selected_parameters : List parameter yang dipilih

    Return:
    - None
    """
    try:
        if filtered_df is None or filtered_df.empty:
            st.warning("There are no data to visualize!")
            return

        parameter_aggregate = {parameter: "mean" for parameter in selected_parameters}
        parameter_by_time = (
            filtered_df.groupby([filtered_df["date_time"].dt.year.rename("year"), filtered_df["date_time"].dt.month.rename("month")])
            .agg(parameter_aggregate)
            .reset_index()
        )
        parameter_by_time["time"] = parameter_by_time["year"].astype(str) + "/" + parameter_by_time["month"].astype(str)

        fig, axes = plt.subplots(len(selected_parameters), 1, figsize = (12, 4 * len(selected_parameters)))
        if len(selected_parameters) == 1:
            axes = [axes]  

        for index, parameter in enumerate(selected_parameters):
            sns.lineplot(
                x = "time",
                y = parameter,
                data = parameter_by_time,
                ax = axes[index]
            )
            axes[index].set_title(f"{parameter} Based On Time")
            axes[index].tick_params(axis = "x", rotation = 60, labelsize = 8)

        fig.tight_layout()
        st.pyplot(fig)

    except Exception as e:
        st.error(f"Terjadi error saat visualisasi data: {e}")


def main():
    df = load_data_handler()
    if df is None:
        return

    st.title("Air Quality Analysis")
    with st.sidebar:
        st.header("Filters")
        st.subheader("Stations")
        station_list = df["station"].unique()
        selected_stations = st.multiselect("Select Stations", station_list)

        st.subheader("Date Range")
        min_date, max_date = df["date_time"].min().date(), df["date_time"].max().date()
        start_date = st.date_input("Start Date", min_value = min_date, max_value = max_date, value = min_date)
        end_date = st.date_input("End Date", min_value = min_date, max_value = max_date, value = max_date)

        st.subheader("Parameters")
        parameter_list = ["PM2.5", "PM10", "SO2", "NO2", "CO", "O3", "AQI"]
        selected_parameters = st.multiselect("Select Parameters", parameter_list)

    if selected_stations and selected_parameters:
        filtered_df = df[
            (df["station"].isin(selected_stations)) &
            (df["date_time"] >= pd.to_datetime(start_date)) &
            (df["date_time"] <= pd.to_datetime(end_date))
        ]

        st.subheader("Air Quality Parameter Comparison")
        plot_air_quality_parameter_comparison_handler(filtered_df, selected_parameters)

        st.subheader("Air Quality Based On Time")
        plot_air_quality_based_on_time_handler(filtered_df, selected_parameters)
    else:
        st.warning("Please select stations and parameters to visualize the data.")


if __name__ == "__main__":
    main()
