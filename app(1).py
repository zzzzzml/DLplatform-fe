from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import datetime
from enum import Enum
import shutil
import zipfile
from pyunpack import Archive
import importlib.util
import pandas as pd
from contextlib import redirect_stdout, redirect_stderr
import io
import uuid

app = Flask(__name__)

# 配置CORS
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

# 配置静态文件服务
app.static_folder = 'uploads'
app.static_url_path = '/static'

# 数据库配置
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/dlplatform'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'

# 文件上传配置
ALLOWED_EXTENSIONS = {'zip', 'rar', '7z'}

# 初始化数据库
db = SQLAlchemy(app)


# 用户类型枚举
class UserType(Enum):
    STUDENT = 'student'
    TEACHER = 'teacher'


# 数据模型定义
class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(50), nullable=False)
    user_type = db.Column(db.Enum(UserType, values_callable=lambda x: [e.value for e in UserType]), nullable=False)
    real_name = db.Column(db.String(50))
    student_id = db.Column(db.String(20))
    profile_completed = db.Column(db.Boolean, default=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.class_id'))
    email = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)

    # 关系
    submissions = db.relationship('Submission', backref='student', lazy=True)
    # 作为学生的成绩
    grades_as_student = db.relationship('Grade', backref='student', lazy=True,
                                        foreign_keys='Grade.student_id')
    # 作为教师的评分
    grades_as_teacher = db.relationship('Grade', backref='teacher', lazy=True,
                                        foreign_keys='Grade.graded_by')
    student_classes = db.relationship('StudentClass', backref='student', lazy=True)


class Class(db.Model):
    __tablename__ = 'classes'

    class_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    class_name = db.Column(db.String(100), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)

    # 关系
    # 班级中的学生（通过class_id关联）
    students = db.relationship('User', backref='class_info', lazy=True,
                               foreign_keys='User.class_id')
    experiments = db.relationship('Experiment', backref='class_info', lazy=True)
    student_classes = db.relationship('StudentClass', backref='class_info', lazy=True)


class StudentClass(db.Model):
    __tablename__ = 'student_classes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.class_id'), nullable=False)


class Experiment(db.Model):
    __tablename__ = 'experiments'

    experiment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    experiment_name = db.Column(db.String(100), nullable=False)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.class_id'), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    publish_time = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    deadline = db.Column(db.TIMESTAMP)

    # 关系
    attachments = db.relationship('ExperimentAttachment', backref='experiment', lazy=True)
    submissions = db.relationship('Submission', backref='experiment', lazy=True)
    grades = db.relationship('Grade', backref='experiment', lazy=True)


class ExperimentAttachment(db.Model):
    __tablename__ = 'experiment_attachments'

    attachment_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    experiment_id = db.Column(db.Integer, db.ForeignKey('experiments.experiment_id'), nullable=False)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    upload_time = db.Column(db.TIMESTAMP, default=datetime.utcnow)


class Submission(db.Model):
    __tablename__ = 'submissions'

    submission_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    experiment_id = db.Column(db.Integer, db.ForeignKey('experiments.experiment_id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    submit_time = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)

    # 关系
    grade = db.relationship('Grade', backref='submission', uselist=False, lazy=True)


class Grade(db.Model):
    __tablename__ = 'grades'

    grade_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    submission_id = db.Column(db.Integer, db.ForeignKey('submissions.submission_id'), nullable=False, unique=True)
    experiment_id = db.Column(db.Integer, db.ForeignKey('experiments.experiment_id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    score = db.Column(db.Numeric(5, 2), nullable=False)
    graded_by = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    graded_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)


def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def insert_experiment_attachment(experiment_id, file_name, file_path, file_size):
    """插入实验附件记录"""
    try:
        attachment = ExperimentAttachment()
        attachment.experiment_id = int(experiment_id)
        attachment.file_name = str(file_name)
        attachment.file_path = str(file_path)
        attachment.file_size = int(file_size)
        db.session.add(attachment)
        db.session.commit()
        return True
    except Exception as e:
        print(f"插入实验附件记录错误: {e}")
        db.session.rollback()
        return False


def insert_submission(experiment_id, student_id, file_name, file_path):
    """插入学生提交记录"""
    try:
        submission = Submission()
        submission.experiment_id = int(experiment_id)
        submission.student_id = int(student_id)
        submission.file_name = str(file_name)
        submission.file_path = str(file_path)
        db.session.add(submission)
        db.session.commit()
        return True
    except Exception as e:
        print(f"插入学生提交记录错误: {e}")
        db.session.rollback()
        return False


@app.route('/api/experiments/upload', methods=['POST'])
def api_experiment_upload():
    try:
        # 检查是否有文件
        if 'file' not in request.files:
            return jsonify({
                'code': 400,
                'message': '没有上传文件'
            }), 400

        file = request.files['file']

        # 检查文件名是否为空
        if file.filename == '':
            return jsonify({
                'code': 400,
                'message': '没有选择文件'
            }), 400

        # 检查文件类型
        if not allowed_file(file.filename):
            return jsonify({
                'code': 400,
                'message': '不支持的文件类型，只支持.zip/.rar/.7z文件'
            }), 400

        # 获取请求参数（支持两种参数名格式）
        experiment_id = request.form.get('experimentId')
        student_id = request.form.get('studentId')
        print(experiment_id)
        print(student_id)
        # 验证参数
        if not experiment_id or not student_id:
            return jsonify({
                'code': 400,
                'message': '缺少必要参数：experiment_id 或 student_id'
            }), 400

        # 验证实验和学生是否存在
        experiment = Experiment.query.get(experiment_id)
        print(experiment)
        if not experiment:
            return jsonify({
                'code': 400,
                'message': '实验不存在'
            }), 400

        student = User.query.get(student_id)
        print(student)
        if not student:
            return jsonify({
                'code': 400,
                'message': '学生不存在'
            }), 400

        # 验证学生是否为student类型
        if student.user_type != UserType.STUDENT:
            return jsonify({
                'code': 400,
                'message': '只有学生可以提交作业'
            }), 400

        # 验证学生是否已提交过该实验
        existing_submission = Submission.query.filter_by(
            experiment_id=experiment_id,
            student_id=student_id
        ).first()
        print(existing_submission)
        # 检查是否超过截止时间
        if experiment.deadline and datetime.utcnow() > experiment.deadline:
            return jsonify({
                'code': 400,
                'message': '实验已超过截止时间，无法提交'
            }), 400
        print("yes")
        experiment_folder = os.path.join('lab' + str(experiment_id), 'testcode')
        file_path = os.path.join(experiment_folder, str(file.filename))
        new_file_name = str(file.filename).split('.')[0]
        new_file_path = os.path.join(experiment_folder, new_file_name)
        if not os.path.exists(experiment_folder):
            os.makedirs(experiment_folder)
        if existing_submission:
            # 如果数据库中记录的旧文件存在，则删除旧文件，实现覆盖上传
            existing_experiment_attachment = ExperimentAttachment.query.filter_by(
                file_name=existing_submission.file_name,
                file_path=existing_submission.file_path
            ).first()
            old_file_path = existing_submission.file_path
            if old_file_path and os.path.exists(old_file_path):
                if os.path.isfile(old_file_path):
                    os.remove(old_file_path)
                elif os.path.isdir(old_file_path):
                    shutil.rmtree(old_file_path)
            # 保存文件
            file.save(file_path)
            # 获取文件大小（KB）
            file_size = os.path.getsize(file_path) // 1024
            # 覆盖数据库中的旧记录
            existing_submission.file_name = new_file_name
            existing_submission.file_path = new_file_path
            existing_submission.submit_time = datetime.utcnow()
            print(existing_experiment_attachment)
            if existing_experiment_attachment:
                existing_experiment_attachment.file_name = new_file_name
                existing_experiment_attachment.file_path = new_file_path
                existing_experiment_attachment.file_size = file_size
            db.session.commit()
        else:
            file.save(file_path)
            # 获取文件大小（KB）
            file_size = os.path.getsize(file_path) // 1024
            # 插入实验附件记录
            if not insert_experiment_attachment(experiment_id, new_file_name, new_file_path, file_size):
                # 删除已保存的文件
                if os.path.exists(file_path):
                    os.remove(file_path)
                return jsonify({
                    'code': 500,
                    'message': '保存实验附件记录失败'
                }), 500
            # 插入学生提交记录
            if not insert_submission(experiment_id, student_id, new_file_name, new_file_path):
                # 删除已保存的文件
                if os.path.exists(file_path):
                    os.remove(file_path)
                return jsonify({
                    'code': 500,
                    'message': '保存学生提交记录失败'
                }), 500
        # 解压文件
        if str(file.filename).lower().endswith('.zip'):
            try:
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(experiment_folder)
                print(file_path)
                os.remove(file_path)
            except Exception as e:
                # 解压失败，删除已保存的文件
                if os.path.exists(file_path):
                    os.remove(file_path)
                return jsonify({
                    'code': 500,
                    'message': f'解压zip文件失败: {e}'
                }), 500
        elif str(file.filename).lower().endswith('.rar') or str(file.filename).lower().endswith('.7z'):
            try:
                Archive(file_path).extractall(experiment_folder)
                os.remove(file_path)
            except Exception as e:
                if os.path.exists(file_path):
                    os.remove(file_path)
                return jsonify({
                    'code': 500,
                    'message': f'解压压缩包失败: {e}'
                }), 500
        return jsonify({
            'code': 200,
            'message': '提交成功'
        })

    except Exception as e:
        print(f"提交过程中发生错误: {e}")
        return jsonify({
            'code': 500,
            'message': '服务器内部错误'
        }), 500


@app.route('/api/experiments/<int:experiment_id>', methods=['GET', 'OPTIONS'])
def get_experiment_detail(experiment_id):
    experiment = Experiment.query.get(experiment_id)
    if not experiment:
        return jsonify({'error': '实验不存在'}), 404
    # 获取教师姓名
    teacher = User.query.get(experiment.teacher_id)
    teacher_name = teacher.real_name or teacher.username if teacher else ''
    return jsonify({
        'id': experiment.experiment_id,
        'title': experiment.experiment_name,
        'teacherName': teacher_name,
        'deadline': experiment.deadline.strftime('%Y-%m-%d %H:%M:%S') if experiment.deadline else '',
        'description': experiment.description,
        'publishTime': experiment.publish_time.strftime('%Y-%m-%d %H:%M:%S') if experiment.publish_time else ''
    })


@app.route('/api/experiments/<int:experiment_id>/uploads', methods=['GET', 'OPTIONS'])
def get_experiment_uploads(experiment_id):
    try:
        submissions = Submission.query.filter_by(experiment_id=experiment_id).all()
        upload_history = []
        for submission in submissions:
            upload_history.append({
                'id': submission.submission_id,
                'fileName': submission.file_name,
                'fileSize': os.path.getsize(submission.file_path) if os.path.exists(submission.file_path) else 0,
                'uploadTime': submission.submit_time.strftime('%Y-%m-%d %H:%M:%S'),
                'status': 'success'
            })
        return jsonify({
            'success': True,
            'data': upload_history
        })
    except Exception as e:
        app.logger.error(f"获取上传历史时发生错误: {str(e)}")
        return jsonify({
            'success': False,
            'message': '获取上传历史失败'
        })


def execute_student_code(student_code_path):
    """
    执行学生提交的Python文件，生成测试CSV，与真实标签比对计算准确度
    """
    try:
        # 获取Flask应用的根目录（DLplatform-be的上级目录）
        app_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        # 构建绝对路径
        absolute_student_code_path = os.path.join(app_root, student_code_path)

        # 检查文件是否存在
        if not os.path.exists(absolute_student_code_path):
            return {
                "score": 0.0,
                "message": f"学生代码文件不存在: {absolute_student_code_path}"
            }

        # 获取学生代码所在目录
        student_dir = os.path.dirname(absolute_student_code_path)

        # 切换到学生代码目录
        original_cwd = os.getcwd()
        os.chdir(student_dir)

        # 捕获输出
        output = io.StringIO()
        error_output = io.StringIO()

        try:
            with redirect_stdout(output), redirect_stderr(error_output):
                # 直接执行学生代码文件，模拟__main__环境
                with open(absolute_student_code_path, 'r', encoding='utf-8') as f:
                    code = f.read()

                # 创建一个新的命名空间来执行代码，模拟__main__环境
                namespace = {'__name__': '__main__'}
                exec(code, namespace)

                # 检查是否生成了预测结果文件
                if not os.path.exists('all_preds.csv'):
                    # 如果没有生成文件，尝试直接调用evaluate_model函数
                    if 'evaluate_model' in namespace and callable(namespace['evaluate_model']):
                        print("找到evaluate_model函数，正在调用...")
                        namespace['evaluate_model']()
                    else:
                        return {"score": 0.0, "message": "学生代码中未找到evaluate_model函数且未生成预测结果"}

                # 检查是否生成了预测结果文件
                preds_file = 'all_preds.csv'
                if os.path.exists(preds_file):
                    # 读取学生生成的预测结果
                    preds_df = pd.read_csv(preds_file)
                    predictions = preds_df.iloc[:, 0].tolist()

                    # 读取真实标签文件
                    labels_file = '../../testdata/all_labels.csv'
                    if os.path.exists(labels_file):
                        labels_df = pd.read_csv(labels_file)
                        true_labels = labels_df.iloc[:, 0].tolist()
                        print('预测值：', predictions)
                        print('真实值：', true_labels)
                        # 计算准确率
                        if len(predictions) == len(true_labels):
                            correct = sum(1 for pred, true in zip(predictions, true_labels) if pred == true)
                            total = len(true_labels)
                            accuracy = (correct / total) * 100

                            return {
                                "score": round(accuracy, 2),
                                "message": f"评测成功，准确率: {accuracy:.2f}%",
                                "correct": correct,
                                "total": total,
                                "predictions_count": len(predictions),
                                "labels_count": len(true_labels)
                            }
                        else:
                            return {
                                "score": 0.0,
                                "message": f"预测结果数量({len(predictions)})与真实标签数量({len(true_labels)})不匹配"
                            }
                    else:
                        return {"score": 0.0, "message": f"真实标签文件不存在: {labels_file}"}
                else:
                    return {"score": 0.0, "message": f"预测结果文件未生成: {preds_file}"}

        except Exception as e:
            error_msg = error_output.getvalue()
            return {
                "score": 0.0,
                "message": f"执行学生代码时发生错误: {str(e)}",
                "error_output": error_msg
            }
        finally:
            # 恢复原始工作目录
            os.chdir(original_cwd)

    except Exception as e:
        print(f"执行学生代码时发生错误: {e}")
        return {"score": 0.0, "message": f"执行学生代码失败: {str(e)}"}


def insert_grade(submission_id, experiment_id, student_id, score, graded_by):
    """插入成绩记录"""
    try:
        # 检查是否已存在成绩记录
        existing_grade = Grade.query.filter_by(submission_id=submission_id).first()

        if existing_grade:
            # 更新现有成绩
            existing_grade.score = score
            existing_grade.graded_by = graded_by
            existing_grade.graded_at = datetime.utcnow()
        else:
            # 插入新成绩
            grade = Grade()
            grade.submission_id = submission_id
            grade.experiment_id = experiment_id
            grade.student_id = student_id
            grade.score = score
            grade.graded_by = graded_by
            db.session.add(grade)

        db.session.commit()
        return True
    except Exception as e:
        print(f"插入成绩记录错误: {e}")
        db.session.rollback()
        return False


@app.route('/api/test', methods=['GET'])
def test_models():
    """
    评测模块接口
    根据实验ID，查找所有提交的模型文件，进行评测并保存成绩
    """
    try:
        # 获取实验ID参数
        experiment_id = request.args.get('experimentId')

        if not experiment_id:
            return jsonify({
                'code': 400,
                'message': '缺少实验ID参数'
            }), 400

        # 验证实验是否存在
        experiment = Experiment.query.get(experiment_id)
        if not experiment:
            return jsonify({
                'code': 400,
                'message': '实验不存在'
            }), 400

        # 获取该实验的所有提交记录，按时间降序排列
        submissions = Submission.query.filter_by(
            experiment_id=experiment_id
        ).order_by(Submission.submit_time.desc()).all()

        if not submissions:
            return jsonify({
                'code': 400,
                'message': '该实验暂无提交记录'
            }), 400

        # 创建临时评测目录
        temp_eval_dir = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_eval')
        if not os.path.exists(temp_eval_dir):
            os.makedirs(temp_eval_dir)

        evaluated_count = 0
        print(submissions)
        for submission in submissions:
            try:
                # 检查学生代码文件是否存在
                student_code_path = os.path.join(submission.file_path, f"{submission.file_name}.py")
                if not os.path.exists(student_code_path):
                    print(f"学生代码文件不存在: {student_code_path}")
                    continue

                # 执行学生代码进行评测
                result = execute_student_code(student_code_path)
                score = result["score"]

                # 保存成绩到数据库
                if insert_grade(submission.submission_id, experiment_id, submission.student_id, score,
                                experiment.teacher_id):
                    evaluated_count += 1
                    print(f"学生 {submission.student_id} 的模型评测完成，得分: {score}, 消息: {result['message']}")
                else:
                    print(f"保存学生 {submission.student_id} 的成绩失败")

            except Exception as e:
                print(f"评测学生 {submission.student_id} 的模型时发生错误: {e}")
                continue

        # 清理临时目录
        if os.path.exists(temp_eval_dir):
            shutil.rmtree(temp_eval_dir)

        # 评测完成后，打包所有提交文件
        try:
            # 获取所有提交的文件路径
            file_paths = []
            for submission in submissions:
                # 假设 file_path 是文件夹，file_name 是文件名
                file_full_path = os.path.join(submission.file_path, submission.file_name)
                if os.path.exists(file_full_path):
                    file_paths.append(file_full_path)
            if file_paths:
                zip_name = f"experiment_{experiment_id}_submissions_{uuid.uuid4().hex[:8]}.zip"
                zip_path = os.path.join(app.config['UPLOAD_FOLDER'], zip_name)
                with zipfile.ZipFile(zip_path, 'w') as zipf:
                    for file in file_paths:
                        zipf.write(file, os.path.basename(file))
                download_url = f"/static/{zip_name}"
            else:
                download_url = None
        except Exception as e:
            print(f'打包下载失败: {e}')
            download_url = None

        return jsonify({
            'code': 200,
            'message': f'评测完成，共评测了 {evaluated_count} 个模型',
            'download_url': download_url
        })

    except Exception as e:
        print(f"评测过程中发生错误: {e}")
        return jsonify({
            'code': 500,
            'message': '服务器内部错误'
        }), 500


# gjh新加
@app.route('/api/student/experiments', methods=['GET', 'OPTIONS'])
def get_student_experiments():
    # 分页参数
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    keyword = request.args.get('keyword', '').strip()
    student_id = ...  # 从token或session获取当前学生ID

    query = Experiment.query

    if keyword:
        query = query.filter(Experiment.experiment_name.like(f'%{keyword}%'))

    total = query.count()
    experiments = query.order_by(Experiment.publish_time.desc()).offset((page - 1) * limit).limit(limit).all()

    # 获取所有教师ID
    teacher_ids = [e.teacher_id for e in experiments]
    teachers = User.query.filter(User.user_id.in_(teacher_ids)).all()
    teacher_map = {t.user_id: t.real_name or t.username for t in teachers}

    # 获取当前学生所有提交
    exp_ids = [e.experiment_id for e in experiments]
    submissions = Submission.query.filter(
        Submission.experiment_id.in_(exp_ids),
        Submission.student_id == student_id
    ).all()
    submitted_map = {s.experiment_id: True for s in submissions}

    data = []
    for e in experiments:
        data.append({
            'id': e.experiment_id,
            'title': e.experiment_name,
            'teacherName': teacher_map.get(e.teacher_id, ''),
            'startTime': e.publish_time.strftime('%Y-%m-%d %H:%M:%S') if e.publish_time else '',
            'endTime': e.deadline.strftime('%Y-%m-%d %H:%M:%S') if e.deadline else '',
            'submitted': submitted_map.get(e.experiment_id, False)
        })

    return jsonify({
        'data': data,
        'total': total
    })


@app.route('/api/teacher/experiments', methods=['GET'])
def get_teacher_experiments():
    experiments = Experiment.query.all()
    data = []
    for e in experiments:
        data.append({
            'id': e.experiment_id,
            'title': e.experiment_name,
            'class_id': e.class_id,
            'deadline': e.deadline.strftime('%Y-%m-%d %H:%M:%S') if e.deadline else '',
        })
    return jsonify({'data': data})


@app.route('/api/classes', methods=['GET'])
def get_classes():
    classes = Class.query.all()
    data = []
    for c in classes:
        data.append({
            'id': c.class_id,
            'name': c.class_name,
            'teacher_id': c.teacher_id
        })
    return jsonify({'data': data})


@app.route('/api/evaluations', methods=['GET'])
def get_evaluations():
    experiment_id = request.args.get('experiment_id')
    class_id = request.args.get('class_id')
    status = request.args.get('status')
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))

    query = db.session.query(
        Submission,
        User,
        Class,
        Grade
    ).join(
        User, Submission.student_id == User.user_id
    ).join(
        Class, User.class_id == Class.class_id
    ).outerjoin(
        Grade, Submission.submission_id == Grade.submission_id
    ).filter(
        Submission.experiment_id == experiment_id
    )

    if class_id and class_id != '':
        query = query.filter(Class.class_id == int(class_id))
    if status and status != '':
        status = int(status)
        if status == 1:  # 已提交未评测
            query = query.filter(Grade.score == None)
        elif status == 2 or status == 3:  # 已评价/已评测
            query = query.filter(Grade.score != None)

    total = query.count()
    results = query.order_by(Submission.submit_time.desc()).offset((page - 1) * limit).limit(limit).all()

    data = []
    for submission, user, class_, grade in results:
        data.append({
            'id': submission.submission_id,
            'experiment_title': submission.experiment.experiment_name,
            'student_name': user.real_name or user.username,
            'class_name': class_.class_name,
            'submit_time': submission.submit_time.strftime('%Y-%m-%d %H:%M:%S') if submission.submit_time else '',
            'status': 3 if grade and grade.score is not None else 1,  # 3:已评测, 1:待评测
            'score': float(grade.score) if grade and grade.score is not None else None,
            'file_path': submission.file_path,
            'file_name': submission.file_name,
        })

    return jsonify({
        'data': {
            'list': data,
            'total': total
        }
    })


if __name__ == "__main__":
    app.run(debug=True)