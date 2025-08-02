import React, { useState } from 'react';

function HealthForm({ currentTemp, onSave, selectedDate }) {
  // このフォーム内だけで使う入力値の状態
  const [inputValue, setInputValue] = useState(currentTemp);

  const handleSubmit = (event) => {
    event.preventDefault(); // フォーム送信のデフォルトの動作をキャンセル
    onSave(inputValue);     // 親から渡された関数を実行してデータを親に渡す
  };

  return (
    <div className="form-container">
      <h3>{selectedDate.toLocaleDateString()} の記録</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          name="temp"
          step="0.1"
          placeholder="体温を入力"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit">記録・更新</button>
      </form>
    </div>
  );
}

export default HealthForm;