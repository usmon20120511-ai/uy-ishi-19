(async () => {
    const sleep = m => new Promise(r => setTimeout(r, m));
    const id = location.pathname.split("/").pop();
    const h = {
        "content-type": "application/json",
        "x-app-audience": "student"
    };
    const get = () =>
        fetch(`https://api.marsit.uz/api/v2/project/tasks/${id}`, {
            headers: h,
            credentials: "include"
        }).then(r => r.json());
    const getDeep = (obj, keys) => {
        for (let key of keys) {
            if (obj && obj[key] !== undefined && obj[key] !== null) {
                return obj[key];
            }
        }
        return null;
    };
    // ОПРЕДЕЛЕНИЕ РЕАЛЬНОГО ТИПА ЗАДАНИЯ
    const getRealType = (task) => {
        if (task.correct_matches || task.ru_correct_matches || task.uz_correct_matches) {
            return "matching";
        }
        if (task.options || task.ru_options || task.uz_options) {
            if (task.correct_answer || task.correct_answers) {
                return "drag_drop";
            }
        }
        if (task.correct_answers && Array.isArray(task.correct_answers)) {
            return "multiple_choice";
        }
        if (task.correct_answer && typeof task.correct_answer === 'object' && !Array.isArray(task.correct_answer)) {
            return "fill_in_blank";
        }
        if (task.correct_answer && (typeof task.correct_answer === 'string' || typeof task.correct_answer === 'number')) {
            return "fill_in_blank";
        }
        return null;
    };
// ПОЛУЧЕНИЕ ПРАВИЛЬНОГО ОТВЕТА
    const getAnswer = (task, realType) => {
        console.log(`  Getting answer for type: ${realType}`);
        
        if (realType === "multiple_choice") {
            let answer = getDeep(task, [
                "correct_answers",
                "ru_correct_answers", 
                "uz_correct_answers",
                "correct_answer"
            ]);
            // Если ответ - объект с ключами, конвертируем в массив индексов
            if (answer && typeof answer === 'object' && !Array.isArray(answer)) {
                // Находим индексы правильных ответов
                let indices = [];
                let options = task.options || task.ru_options || task.uz_options || [];
                for (let key in answer) {
                    let value = answer[key];
                    let index = options.indexOf(value);
                    if (index !== -1) indices.push(index);
                }
                return indices.length ? indices : answer;
            }
            return answer;
        }
        
        if (realType === "fill_in_blank") {
            let answer = getDeep(task, [
                "correct_answers",
                "ru_correct_answers",
                "uz_correct_answers", 
                "correct_answer"
            ]);
            if (answer && typeof answer === 'object' && !Array.isArray(answer)) {
                return answer;
            }
            if (answer && Array.isArray(answer)) {
                let result = {};
                answer.forEach((val, idx) => {
                    result[idx + 1] = val;
                });
                return result;
            }
            if (answer) {
                return {1: answer};
            }
            return null;
        }
        
        if (realType === "matching") {
            const matches = getDeep(task, [
                "correct_matches",
                "ru_correct_matches", 
                "uz_correct_matches"
            ]);
            if (!matches) return null;
            
            // Возвращаем объект соответствий
            let result = {};
            for (let [left, right] of Object.entries(matches)) {
                result[left] = right;
            }
            return result;
        }
        
        if (realType === "drag_drop") {
            const corr = getDeep(task, [
                "correct_answer",
                "correct_answers",
                "ru_correct_answer",
                "uz_correct_answer"
            ]);
            const opts = getDeep(task, [
                "options",
                "ru_options", 
                "uz_options"
            ]);
            if (!corr || !opts) return null;
            
            let result = {};
            for (let [key, value] of Object.entries(corr)) {
                if (typeof value === 'number' || typeof value === 'string') {
                    result[key] = opts[value] !== undefined ? opts[value] : value;
                } else {
                    result[key] = value;
                }
            }
            return result;
        }
        
        return null;
    };
// ОТПРАВКА ОТВЕТА
    const sendAnswer = async (tid, task, realType) => {
        const answer = getAnswer(task, realType);
        
        if (!answer) {
            console.log(`  ❌ Could not generate answer`);
            return false;
        }
        
        console.log(`  Answer:`, answer);
        
        // Пробуем отправить с реальным типом
        let res = await fetch(`https://api.marsit.uz/api/v2/project/tasks/${tid}/submit`, {
            method: "POST",
            headers: h,
            credentials: "include",
            body: JSON.stringify({
                task_type: realType,
                answer: answer
            })
        }).then(r => r.json());
        
        console.log(`  Result: ${res.is_correct ? '✅ CORRECT' : '❌ WRONG'}`);
        if (!res.is_correct && res.explanation) {
            console.log(`  Explanation: ${res.explanation}`);
        }
        
        return res.is_correct;
    };
// ОСНОВНАЯ ФУНКЦИЯ
    async function run() {
        console.log("🚀 Starting auto-solver...\n");
        
        let maxAttempts = 30;
        let attempts = 0;
        let allCompleted = false;
        
        while (attempts < maxAttempts && !allCompleted) {
            attempts++;
            console.log(`\n📡 Attempt ${attempts} - Fetching data...`);
            
            let d = await get();
            
            if (!d || !d.quiz_session) {
                console.log("❌ No quiz session found");
                break;
            }
            
            // Собираем все задачи в один объект
            let tasksMap = {};
            const groups = [
                "multiple_choice_tasks",
                "fill_in_blank_tasks", 
                "matching_tasks",
                "drag_drop_tasks"
            ];
            
            groups.forEach(group => {
                (d[group] || []).forEach(task => {
                    tasksMap[task.id] = task;
                });
            });
            
            // Находим невыполненные задачи
            let incomplete = [];
            for (let item of d.quiz_session.selected_task_order) {
                let task = tasksMap[item.id];
                if (task && task.is_correct !== true) {
                    incomplete.push({
                        id: item.id,
                        declaredType: item.type,
                        task: task
                    });
                }
            }
            
            console.log(`📊 Total tasks: ${d.quiz_session.selected_task_order.length}`);
            console.log(`✅ Completed: ${d.quiz_session.selected_task_order.length - incomplete.length}`);
            console.log(`⏳ Remaining: ${incomplete.length}`);
            
            if (incomplete.length === 0) {
                console.log("\n🎉 ALL TASKS COMPLETED! 🎉");
                allCompleted = true;
                break;
            }
            
            // Обрабатываем первое невыполненное задание
            let { id: tid, declaredType, task } = incomplete[0];
            
            console.log(`\n🔧 Processing task ${tid}`);
            console.log(`  Declared type: ${declaredType}`);
            console.log(`  Question: ${task.question || task.question_rus || 'N/A'}`);
            
            // Определяем реальный тип
            let realType = getRealType(task);
            if (realType && realType !== declaredType) {
                console.log(`  ⚠️ Type mismatch! Detected: ${realType} (was: ${declaredType})`);
            } else if (!realType) {
                realType = declaredType;
                console.log(`  Using declared type: ${realType}`);
            } else {
                console.log(`  Using detected type: ${realType}`);
            }
            
            // Отправляем ответ
            let success = await sendAnswer(tid, task, realType);
            
            if (!success && realType !== declaredType) {
                // Если не получилось с реальным типом, пробуем с объявленным
                console.log(`  🔄 Trying with declared type: ${declaredType}`);
                success = await sendAnswer(tid, task, declaredType);
            }
            
            if (!success) {
                console.log(`  ⚠️ Failed to solve task ${tid}`);
                // Выводим структуру задачи для отладки
                console.log("  Task structure:", Object.keys(task));
                if (task.correct_matches) console.log("  correct_matches:", task.correct_matches);
                if (task.correct_answers) console.log("  correct_answers:", task.correct_answers);
                if (task.correct_answer) console.log("  correct_answer:", task.correct_answer);
            }
            
            await sleep(2000);
        }
        
        if (!allCompleted) {
            console.log("\n⚠️ Reached maximum attempts");
        }
        
        console.log("\n✨ Script finished!");
    }
    await run();
    alert("Bajarildi!");
})();
