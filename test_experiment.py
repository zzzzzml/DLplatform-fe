#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
深度学习实验测试文件
实验名称：基于Vue3的组件化开发实践
学生：测试用户
日期：2025-01-15
"""

import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

class Vue3Experiment:
    """
    Vue3组件化开发实验类
    模拟前端组件化开发的数据处理流程
    """
    
    def __init__(self):
        self.data = None
        self.model = None
        self.results = {}
    
    def generate_sample_data(self, n_samples=1000, n_features=20):
        """
        生成模拟的Vue组件数据
        模拟组件间的数据传递和状态管理
        """
        print("正在生成Vue组件模拟数据...")
        
        # 生成分类数据，模拟组件间的交互
        X, y = make_classification(
            n_samples=n_samples,
            n_features=n_features,
            n_informative=15,
            n_redundant=5,
            random_state=42
        )
        
        self.data = {
            'X': X,
            'y': y,
            'feature_names': [f'component_{i}' for i in range(n_features)]
        }
        
        print(f"生成了 {n_samples} 个样本，{n_features} 个特征")
        return self.data
    
    def split_data(self, test_size=0.2):
        """
        分割数据，模拟Vue组件的数据流
        """
        if self.data is None:
            raise ValueError("请先生成数据")
        
        X_train, X_test, y_train, y_test = train_test_split(
            self.data['X'],
            self.data['y'],
            test_size=test_size,
            random_state=42
        )
        
        self.data['X_train'] = X_train
        self.data['X_test'] = X_test
        self.data['y_train'] = y_train
        self.data['y_test'] = y_test
        
        print(f"数据分割完成：训练集 {X_train.shape[0]} 样本，测试集 {X_test.shape[0]} 样本")
        return X_train, X_test, y_train, y_test
    
    def train_model(self):
        """
        训练模型，模拟Vue组件的状态管理
        """
        if 'X_train' not in self.data:
            raise ValueError("请先分割数据")
        
        print("开始训练Vue组件状态管理模型...")
        
        # 使用逻辑回归模拟组件状态预测
        self.model = LogisticRegression(random_state=42, max_iter=1000)
        self.model.fit(self.data['X_train'], self.data['y_train'])
        
        print("模型训练完成")
        return self.model
    
    def evaluate_model(self):
        """
        评估模型性能，模拟Vue组件的性能监控
        """
        if self.model is None:
            raise ValueError("请先训练模型")
        
        print("开始评估模型性能...")
        
        # 预测
        y_pred = self.model.predict(self.data['X_test'])
        
        # 计算准确率
        accuracy = accuracy_score(self.data['y_test'], y_pred)
        
        # 生成分类报告
        report = classification_report(self.data['y_test'], y_pred)
        
        self.results = {
            'accuracy': accuracy,
            'predictions': y_pred,
            'report': report
        }
        
        print(f"模型准确率: {accuracy:.4f}")
        print("\n分类报告:")
        print(report)
        
        return self.results
    
    def visualize_results(self):
        """
        可视化结果，模拟Vue组件的图表展示
        """
        if not self.results:
            raise ValueError("请先评估模型")
        
        print("生成可视化图表...")
        
        # 创建图表
        fig, axes = plt.subplots(2, 2, figsize=(12, 10))
        
        # 1. 特征重要性
        feature_importance = np.abs(self.model.coef_[0])
        top_features = np.argsort(feature_importance)[-10:]
        
        axes[0, 0].barh(range(10), feature_importance[top_features])
        axes[0, 0].set_yticks(range(10))
        axes[0, 0].set_yticklabels([self.data['feature_names'][i] for i in top_features])
        axes[0, 0].set_title('Vue组件特征重要性')
        axes[0, 0].set_xlabel('重要性')
        
        # 2. 预测结果分布
        axes[0, 1].hist(self.results['predictions'], bins=2, alpha=0.7)
        axes[0, 1].set_title('预测结果分布')
        axes[0, 1].set_xlabel('预测类别')
        axes[0, 1].set_ylabel('频次')
        
        # 3. 准确率展示
        axes[1, 0].pie([self.results['accuracy'], 1-self.results['accuracy']], 
                      labels=['正确', '错误'], autopct='%1.1f%%')
        axes[1, 0].set_title('模型准确率')
        
        # 4. 混淆矩阵（简化版）
        from sklearn.metrics import confusion_matrix
        cm = confusion_matrix(self.data['y_test'], self.results['predictions'])
        im = axes[1, 1].imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
        axes[1, 1].set_title('混淆矩阵')
        axes[1, 1].set_xlabel('预测标签')
        axes[1, 1].set_ylabel('真实标签')
        
        # 添加数值标签
        for i in range(cm.shape[0]):
            for j in range(cm.shape[1]):
                axes[1, 1].text(j, i, str(cm[i, j]), 
                              ha="center", va="center", color="white" if cm[i, j] > cm.max() / 2 else "black")
        
        plt.tight_layout()
        plt.savefig('vue3_experiment_results.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        print("可视化图表已保存为 'vue3_experiment_results.png'")
    
    def run_experiment(self):
        """
        运行完整的实验流程
        """
        print("=" * 50)
        print("开始Vue3组件化开发实验")
        print("=" * 50)
        
        try:
            # 1. 生成数据
            self.generate_sample_data()
            
            # 2. 分割数据
            self.split_data()
            
            # 3. 训练模型
            self.train_model()
            
            # 4. 评估模型
            self.evaluate_model()
            
            # 5. 可视化结果
            self.visualize_results()
            
            print("=" * 50)
            print("实验完成！")
            print("=" * 50)
            
            return True
            
        except Exception as e:
            print(f"实验过程中出现错误: {e}")
            return False

def main():
    """
    主函数
    """
    # 创建实验实例
    experiment = Vue3Experiment()
    
    # 运行实验
    success = experiment.run_experiment()
    
    if success:
        print("实验成功完成！")
        print(f"最终准确率: {experiment.results['accuracy']:.4f}")
    else:
        print("实验失败，请检查代码")

if __name__ == "__main__":
    main() 