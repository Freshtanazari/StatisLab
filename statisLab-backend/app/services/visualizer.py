import seaborn as sns 
import matplotlib.pyplot as plt
import pandas as pd
import os
import uuid

from app.storage.DatasetStore import DatasetStore



class Visualizer:
    
    def __init__(self,sessionId,store, save_dir = "plots", palette="husl", theme="whitegrid"):
        self.session_id = sessionId
        self.df = store.getDataset(sessionId).df_current
        self.base_save_dir = save_dir
        self.save_dir = os.path.join(save_dir, sessionId)
        self.dataset = store.getDataset(sessionId) 
        self.palette = palette
        self.theme = theme
        os.makedirs(self.save_dir, exist_ok=True)
        sns.set_theme(style=self.theme, palette=self.palette)
        # plt.style.use("classic")  # applies to all plots

    # helper function for saving the plots:
    def save_plots(self, fig, plot_name, columns = None, file_suffix = None):
        def _sanitize_file_part(value):
            return "".join(
                char if char.isalnum() or char in {"-", "_"} else "_"
                for char in str(value)
            )[:50]

        if file_suffix is None:
            if columns:
                file_suffix = "_".join(_sanitize_file_part(column) for column in columns if column)
            else:
                file_suffix = "all"
        
        file_name = f"{plot_name}_{file_suffix}_{uuid.uuid4().hex}.png"
        save_path = os.path.join(self.save_dir, file_name)
        fig.savefig(save_path, bbox_inches="tight")
        plt.close(fig)
        result =  {
            "plot_name" : plot_name, 
            "plot_columns" : columns, 
            "saved_path" : file_name,
            "plot_url": f"/plots/{file_name}",
        }
        self.dataset.report.addAnalysis(result)
        return result

# univariate plots:(single variable)
    def boxplot(self, col):
        fig, ax = plt.subplots()
        sns.boxplot(y = self.df[col],color=sns.color_palette(self.palette)[0], ax = ax)

        return self.save_plots(fig, plot_name="boxplot", columns=[col])

    def histogram(self, col):

        fig, ax = plt.subplots()
        sns.histplot(x = self.df[col],color=sns.color_palette(self.palette)[0], ax = ax)

        return self.save_plots(fig, plot_name="historgram", columns=[col])
       


    def kde(self,col):
        fig, ax = plt.subplots()
        sns.kdeplot(x = self.df[col],color=sns.color_palette(self.palette)[0], ax = ax)

        return self.save_plots(fig, plot_name="kde", columns=[col])
    

    def barplot(self, col):
        fig, ax = plt.subplots()
        #count each category 
        counts = self.df[col].value_counts()

        sns.barplot(x = counts.index, y = counts.values,palette=self.palette, ax = ax)
        ax.set_xlabel(col)
        ax.set_ylabel("count")
        ax.set_title(f"Barplot of {col}")

        return self.save_plots(fig, plot_name="barplot", columns=[col])


    def pieChart(self, col):
        fig, ax = plt.subplots()
        #aggregate categorical data

        counts = self.df[col].value_counts()
        colors = sns.color_palette(self.palette, len(counts))
        ax.pie(
            counts.values,
            labels = counts.index,
            autopct = "%1.1f%%",
            colors = colors,
            startangle = 90,
        )
        ax.set_title(f"pie chart of {col}")
        ax.axis("equal")
        return self.save_plots(fig, plot_name="pie_chart", columns=[col])


#bivariate plots 

    def scatterplot(self, xcol, ycol):

        fig, ax = plt.subplots()

        sns.scatterplot(x=self.df[xcol], y = self.df[ycol], color=sns.color_palette(self.palette)[0],ax = ax)

        # labels and title 
        ax.set_xlabel(xcol)
        ax.set_ylabel(ycol)
        ax.set_title(f"Scatterplot of {ycol} vs {xcol}")

        # save the figure 
        return self.save_plots(fig, plot_name="scatterplot", columns=[xcol, ycol])

    def lineplot(self, xcol, ycol):

        fig, ax = plt.subplots()

        sns.lineplot(x=self.df[xcol], y = self.df[ycol],color=sns.color_palette(self.palette)[0],ax = ax)

        # labels and title 
        ax.set_xlabel(xcol)
        ax.set_ylabel(ycol)
        ax.set_title(f"Lineplot of {ycol} vs {xcol}")

        # save the figure 
        return self.save_plots(fig, plot_name="lineplot", columns=[xcol, ycol])

    def violinplot(self, numericCol, categoricCol):
        if numericCol not in self.df.columns:
            raise ValueError("Numeric oclumns not found")
        
        fig, ax = plt.subplots(figsize=(8,6))
        if categoricCol:
            sns.violinplot(x=self.df[categoricCol], y=self.df[numericCol], palette=self.palette, ax=ax)
            plotColumns = [categoricCol, numericCol]
            fileSuffix = f"{numericCol}_by_{categoricCol}"
        else:
            sns.violinplot(y=self.df[numericCol], color=sns.color_palette(self.palette)[0], ax = ax)
            plotColumns = [numericCol]
            fileSuffix = numericCol
        
        ax.set_title("violin plot")

        return self.save_plots(fig, plot_name="violinplot", columns=[numericCol, categoricCol])


# multivariate plots

    def pairplot(self):
        numericDf = self.df.select_dtypes(include="number")
        if numericDf.empty:
            raise ValueError("No numeric columns available")
        
        g = sns.pairplot(numericDf, diag_kind="hist", palette= self.palette)
        fig = g.figure
        return self.save_plots(fig, plot_name="pairplot", columns=numericDf.columns.tolist())

    def heatmap(self):

        numericDf = self.df.select_dtypes(include="number")
        if numericDf.empty:
            raise ValueError("No numeric columns available")
        
        fig,ax = plt.subplots(figsize=(8,6))

        sns.heatmap(numericDf.corr(), annot= True, cmap = "coolwarm")

        ax.set_title("Correlation heatmap")

        return self.save_plots(fig, plot_name="heatmap")

    def catplot(self):
        pass
    def jointPlot(self):
        pass

        # get heapmap of missingness
    def get_missingness_heatmap(self):
        fig, ax = plt.subplots(figsize = (10, 6))
        sns.heatmap(self.df.isnull(), cbar=False)
        plt.title("Missingness Heatmap")
        return self.save_plots(fig, plot_name="missingness_heatmap")


def main():
    df = pd.read_csv("sample_data/vizsampledata.csv")
    # viz = Visualizer(df)
    # theme, and palette
    viz = Visualizer(df, palette="coolwarm", theme="darkgrid")

    result_box = viz.boxplot("salary")
    result_hist = viz.histogram("age")
    result_kde = viz.kde("age")
    result_bar = viz.barplot("gender")
    result_scatter = viz.scatterplot("age", "salary")
    result_line = viz.lineplot("age", "salary")
    result_pie = viz.pieChart("gender")
    result_heatmap = viz.heatmap()
    result_pairplot = viz.pairplot()
    result_violinplot = viz.violinplot("salary", "gender")


    # Print results
    print(result_box)
    print(result_hist)
    print(result_kde)
    print(result_bar)
    print(result_scatter)
    print(result_line)
    print(result_pie)


if __name__ == "__main__":
    main()