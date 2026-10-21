---
title: "利用pheatmap制作热图"
author: "薛嵩"
date: "2025-02-26"
categories: ["data-analysis"]
tags:
- R
- pheatmap
- 数据可视化
- 抗体
---

{{< callout type="error" emoji="🤖" >}}
**AI 使用声明**：本文的大纲由作者确定，AI 工具（Claude 与 DeepSeek）辅助完成初稿起草与格式整理。作者已审校本文全部内容，并对准确性承担最终责任。
{{< /callout >}}

这篇文章描述了如何合并来自不同实验的多个值以创建热图的方法。

<!--more-->

以下步骤展示了如何从 Excel 文件中读取数据，将其合并并用于制作美观的热图。

## 准备 R 包

需要以下 R 包：  
- **readxl** 和 **writexl** 用于输入/输出数据  
- **dplyr** 和 **scales** 用于处理数据  
- **pheatmap**、**ggplot2** 和 **tidyverse** 用于绘图  


``` r
library(readxl)
library(writexl)
library(scales)
library(pheatmap)
library(ggplot2)
library(tidyverse)
```

## 数据处理

### 设置输入文件或文件夹路径


``` r
input_file_path = "./serum_dataset/vaccine serum samples-wt delta omi.xlsx"
input_folder_path = "./serum_dataset"
# 替换为您的文件或文件夹路径
```

通常，我会将图表导出到与输入文件相同的文件夹中：


``` r
outputpath = paste0(dirname(input_file_path),"\\heatmap.pdf") 
```

此 `outputpath` 将命名为 **"heatmap.pdf"**，并保存在与输入文件相同的文件夹中：


```
[1] "./serum_dataset\\heatmap.pdf"
```

如果选择文件夹路径作为输入，则 `outputpath` 应与 `input_folder_path` 相同：


``` r
outputpath = input_folder_path
outputpath
```

### 读取数据

确保您的 Excel 文件中的数据格式如下所示：



| sample | WT-1 | WT-2 | WT-3 | WT-4 | WT-5 | WT-6 | WT-7 | WT-8  | WT-9  | Delta-1 | Delta-2 | Delta-3 | Delta-4 | Delta-5 | Delta-6 | Delta-7 | Delta-8 | Delta-9 | Omicron-1 | Omicron-2 | Omicron-3 | Omicron-4 | Omicron-5 | Omicron-6 | Omicron-7 | Omicron-8 | Omicron-9 |
|:------:|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:-----:|:-----:|:-------:|:-------:|:-------:|:-------:|:-------:|:-------:|:-------:|:-------:|:-------:|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|:---------:|
|  249   | 3490 | 3566 | 3701 | 3823 | 3796 | 3779 | 4106 | 6278  | 11691 |  2318   |  2265   |  2270   |  2361   |  2399   |  2625   |  4045   |  19085  |  42810  |   2688    |   2691    |   2608    |   2743    |   2742    |   2697    |   2756    |   3168    |   10036   |
|   NA   | 3236 | 3265 | 3310 | 3453 | 3100 | 2996 | 3179 | 10101 | 17397 |  2160   |  2154   |  2158   |  2899   |  2047   |  2424   |  6343   |  10983  |  41618  |   2550    |   2473    |   2521    |   2474    |   2317    |   2331    |   2356    |   3451    |   7322    |
|  230   | 2384 | 2528 | 2675 | 2620 | 2673 | 2764 | 4490 | 10318 | 18427 |  1879   |  2515   |  1857   |  1938   |  2726   |  4257   |  12521  |  23052  |  57013  |   2255    |   2264    |   2126    |   2276    |   2062    |   2187    |   2262    |   2363    |   5507    |
|   NA   | 2394 | 2296 | 2315 | 2243 | 2376 | 3073 | 5018 | 14496 | 18438 |  1852   |  1869   |  1849   |  1792   |  1907   |  4469   |  16023  |  23121  |  29738  |   2121    |   2088    |   2464    |   2183    |   2036    |   1983    |   1931    |   2320    |   4665    |
|  244   | 1958 | 1936 | 2026 | 2005 | 1976 | 2474 | 2137 | 4656  | 11394 |  1698   |  2007   |  1678   |  1796   |  1647   |  1795   |  3571   |  9030   |  30330  |   2038    |   1889    |   2044    |   1917    |   1911    |   2243    |   2243    |   2969    |   6628    |
|   NA   | 1832 | 1921 | 1920 | 1790 | 1854 | 1996 | 2062 | 3999  | 10572 |  1703   |  1662   |  1543   |  1523   |  1683   |  3228   |  3715   |  7058   |  20046  |   1858    |   1881    |   1799    |   1760    |   1749    |   1736    |   1984    |   2797    |   8719    |



**Sample** 列将用作合并数据的关键列。  
如果您的数据格式与上述示例匹配，可以通过以下命令读取数据：

- 如果您的数据存储在不同的 Excel 文件中，并且每个文件仅包含 **一个** 工作表：


``` r
file_names <- list.files(input_folder_path, pattern = "\\.xlsx$|\\.xls$", full.names = TRUE)
merged.data = list()
for (i in 1:length(file_names)) {
    # 读取 Excel 文件中的数据
    data <- read_excel(file_names[i])
    colnames(data)[1] = "sample"
    # 合并数据
    merged.data[[i]] = data
}
merged_df = merged.data[[1]]
```

让我们看一下输出的 `merged_df`：

这是一个数据框：


``` r
class(merged_df)
[1] "tbl_df"     "tbl"        "data.frame"
```

### 数据处理

此 `merged_df` 将作为输入进行进一步处理，包括 **合并批次**、**去除 `NA` 值** 和 **标准化**。

#### **合并批次** 和 **去除 `NA` 值**


```
 [1] "sample"    "WT-1"      "WT-2"      "WT-3"      "WT-4"      "WT-5"     
 [7] "WT-6"      "WT-7"      "WT-8"      "WT-9"      "Delta-1"   "Delta-2"  
[13] "Delta-3"   "Delta-4"   "Delta-5"   "Delta-6"   "Delta-7"   "Delta-8"  
[19] "Delta-9"   "Omicron-1" "Omicron-2" "Omicron-3" "Omicron-4" "Omicron-5"
[25] "Omicron-6" "Omicron-7" "Omicron-8" "Omicron-9"
```

#### 使用 Z-score 进行标准化

Z-score通常用于标准化。[这里](https://zhuanlan.zhihu.com/p/69074703)是其定义的详细解释。简单来说，我们使用公式 __(x-μ)/σ__ 分别计算 **Binding**、**Neutralization**、**ADE** 和 **Competition ELISA** 实验的 Z-score。


``` r
output.data = merged_df %>% na.omit()
rownames(output.data) = output.data$sample
output.data$sample = NULL
```

查看 `output.data`：



| WT-1 | WT-2 | WT-3 | WT-4 | WT-5 | WT-6 | WT-7 | WT-8  | WT-9  |
|:----:|:----:|:----:|:----:|:----:|:----:|:----:|:-----:|:-----:|
| 3490 | 3566 | 3701 | 3823 | 3796 | 3779 | 4106 | 6278  | 11691 |
| 2384 | 2528 | 2675 | 2620 | 2673 | 2764 | 4490 | 10318 | 18427 |



---

## 创建热图

现在您已经准备好数据来制作热图，但仍需完成一些设置。

### 注释列和行

注意，列注释必须与 `output.data` 中的顺序匹配。  
因此，您可能需要仔细检查 `output.data` 的排列方式：


``` r
colnames(output.data)
 [1] "WT-1"      "WT-2"      "WT-3"      "WT-4"      "WT-5"      "WT-6"     
 [7] "WT-7"      "WT-8"      "WT-9"      "Delta-1"   "Delta-2"   "Delta-3"  
[13] "Delta-4"   "Delta-5"   "Delta-6"   "Delta-7"   "Delta-8"   "Delta-9"  
[19] "Omicron-1" "Omicron-2" "Omicron-3" "Omicron-4" "Omicron-5" "Omicron-6"
[25] "Omicron-7" "Omicron-8" "Omicron-9"
```

现在，您可以按照以下命令设置注释：


``` r
  annotation_col= data.frame(Datatype = factor(rep(c("WT","Delta","omi"),c(9,9,9))))
  rownames(annotation_col) = colnames(output.data)
  ann_colors = list(Datatype = c(WT="#3567E5",Delta="#B0E65E",omi="#91726B"))
```

### 设置图例分段

`break` 参数对热图的输出格式非常重要，因为它决定了数据在特定范围内的代表颜色。这里我们使用一个 `bk` 因子来设置它。


``` r
 bk = seq(-2,5,by = 1)
```

### 绘制热图

最后，我们到达了这一步：


``` r
 # 热图
  p1 <- pheatmap(output.data,  # 您准备好的数据
                 color = c(colorRampPalette(c('#C6DAF1','white','red'),bias = 1.7)(6)), 
                 # 设置颜色，这里我在浅蓝色和红色之间设置了 6 种颜色
                 border_color = "black",  # 设置边框颜色，NA 表示无边框
                 scale= "none", 
                 # "column" 表示对每列进行 Z-score 标准化，
                 # "row" 表示对每行进行 Z-score 标准化，
                 # "none" 表示不进行标准化，
                 # 我们选择 "none"，因为之前已经完成了标准化。
                 cluster_rows = TRUE, # 是否按行聚类
                 cluster_cols = FALSE, # 是否按列聚类
                 legend = TRUE, # 是否显示图例
                 breaks = bk, # 设置分段
                 legend_breaks = c(-2:5), # 设置图例分段
                 legend_labels = c(-2:5), # 设置图例分段的标签
                 show_rownames = FALSE, 
                 show_colnames = FALSE, 
                 display_numbers = FALSE,
                 fontsize = 10, # 设置字体大小
                 annotation_col =annotation_col,
                 annotation_colors = ann_colors,
                 angle_col = 0,
                 cutree_rows=4, # 按聚类结果分割热图
  )
```

<img src="/blog/ADE_heatmap/heatmap.zh-cn_files/figure-html/unnamed-chunk-15-1.png" width="1920" style="display: block; margin: auto;" />

我们完成了！现在享受您的热图吧！

---

### 保存热图


``` r
 ggsave(file = outputpath, plot = p1,width = 11,height = 10,dpi = 300)
```

