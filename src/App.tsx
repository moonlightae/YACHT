import React, { useState, useEffect, useCallback } from 'react';

// 타입 정의
type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;
type CategoryKey =
  | "one" | "two" | "thr" | "fou" | "fiv" | "six"
  | "thr_of_a_kind" | "fou_of_a_kind" | "FullHouse"
  | "smallstrate" | "largestrate" | "Yacht" | "chance";

interface Category {
  key: CategoryKey;
  name: string;
  description: string;
  num: number;
}

interface UsedCategories {
  [key: string]: number;
}

interface DiceCounts {
  [key: number]: number;
}

const YachtGame: React.FC = () => {
  const [dice, setDice] = useState<DiceValue[]>([1, 2, 3, 4, 5]);
  const [diceLocked, setDiceLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [rerollCount, setRerollCount] = useState<number>(3);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [usedCategories, setUsedCategories] = useState<UsedCategories>({});
  const [diceDisplay, setDiceDisplay] = useState<string[]>(["notLock", "notLock", "notLock", "notLock", "notLock" ]);
  const [catDisplay, setCatDisplay] = useState<string[]>(["notCat", "notCat", "notCat", "notCat", "notCat", "notCat", "notCat", "notCat", "notCat", "notCat", "notCat", "notCat", "notCat", "notCat"]);
  const [notStart, setNotStart] = useState<boolean>(true);
  const [message, setMessage] = useState<number>(0);
  const categories: Category[] = [
    { key: "one", name: "Ones", description: "눈이 1인 주사위의 합계", num: 1},
    { key: "two", name: "Twos", description: "눈이 2인 주사위의 합계", num: 2},
    { key: "thr", name: "Threes", description: "눈이 3인 주사위의 합계", num: 3},
    { key: "fou", name: "Fours", description: "눈이 4인 주사위의 합계", num: 4},
    { key: "fiv", name: "Fives", description: "눈이 5인 주사위의 합계", num: 5},
    { key: "six", name: "Sixes", description: "눈이 6인 주사위의 합계", num: 6},
    { key: "thr_of_a_kind", name: "Three of a Kind", description: "3개 이상이 같은 수", num: 7},
    { key: "fou_of_a_kind", name: "Four of a Kind", description: "4개 이상이 같은 수", num: 8},
    { key: "FullHouse", name: "Full House", description: "2개와 3개가 각각 같은 수", num: 9},
    { key: "smallstrate", name: "Small Straight", description: "연속되는 4개의 수 ※ 30점 고정", num: 10},
    { key: "largestrate", name: "Large Straight", description: "연속되는 5개의 수 ※ 40점 고정", num: 11},
    { key: "Yacht", name: "Yacht", description: "5개 모두 같은 수 ※ 50점 고정", num: 12},
    { key: "chance", name: "Chance", description: "모든 주사위 합계", num: 13}
  ];


  // 초기 주사위 굴리기
  useEffect(() => {
  }, []);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'r' || event.key === 'R') {
        if (rerollCount > 0) {
          rollDice();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rerollCount, diceLocked]);

  const generateRandomDice = (): DiceValue => {
    return (Math.floor(Math.random() * 6) + 1) as DiceValue;
  };

  const setM = useCallback<Function>((diceValues: DiceValue[]): void => {
    const counts: DiceCounts = diceValues.reduce((acc: DiceCounts, val: DiceValue) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    const countValues: number[] = Object.values(counts);
    const sortedCounts: number[] = countValues.sort();
    const straights: number[][] = [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]];
    const sorted: DiceValue[] = [...diceValues].sort((a, b) => a - b);

    if (countValues.some(c => c === 5)) {
      setMessage(1);  // 야추
    } else if (countValues.some(c => c >= 4)) {
      setMessage(2);  // 포옵카
    } else if (countValues.some(c => c >= 3)) {
      setMessage(3);  // 쓰옵카
    } else if (JSON.stringify(sortedCounts) === JSON.stringify([2, 3])) {
      setMessage(4);  // 풀하
    } else if (JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5]) ||JSON.stringify(sorted) === JSON.stringify([2, 3, 4, 5, 6])) {
      setMessage(5);  // 롱스
    } else if (straights.some(straight => straight.every(num => diceValues.includes(num as DiceValue)))) {
      setMessage(6);  // 숏스
    } else {
      setMessage(0);
    }
  }, []);

  const rollDice = (): void => {
    if (notStart) setNotStart(false);
    if (rerollCount > 0) {
      setDice(prev => prev.map((die, index) =>
        diceLocked[index] ? die : generateRandomDice()
      ));
      setRerollCount(prev => prev - 1);
    }
    // setM(dice);
  };
  const toggleDiceLock = (index: number): void => {
    if (notStart) return;
    setDiceLocked(prev => prev.map((locked, i) =>
      i === index ? !locked : locked
    ));
    setDiceDisplay(prev => prev.map((locked, i) =>
      i === index ? locked === "notLock" ? "yeahLock" : "notLock" : locked
    ))
  };

  const getScore = (category: CategoryKey, diceValues: DiceValue[]): number => {
    const counts: DiceCounts = diceValues.reduce((acc: DiceCounts, val: DiceValue) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});

    const total: number = diceValues.reduce((sum: number, val: DiceValue) => sum + val, 0);
    const countValues: number[] = Object.values(counts);

    switch (category) {
      case "one": return diceValues.filter(d => d === 1).length * 1;
      case "two": return diceValues.filter(d => d === 2).length * 2;
      case "thr": return diceValues.filter(d => d === 3).length * 3;
      case "fou": return diceValues.filter(d => d === 4).length * 4;
      case "fiv": return diceValues.filter(d => d === 5).length * 5;
      case "six": return diceValues.filter(d => d === 6).length * 6;
      case "thr_of_a_kind": return countValues.some(c => c >= 3) ? total : 0;
      case "fou_of_a_kind": return countValues.some(c => c >= 4) ? total : 0;
      case "FullHouse": {
        const sortedCounts: number[] = countValues.sort();
        return JSON.stringify(sortedCounts) === JSON.stringify([2, 3]) ? 25 : 0;
      }
      case "smallstrate": {
        const straights: number[][] = [
          [1, 2, 3, 4],
          [2, 3, 4, 5],
          [3, 4, 5, 6]
        ];
        return straights.some(straight =>
          straight.every(num => diceValues.includes(num as DiceValue))
        ) ? 30 : 0;
      }
      case "largestrate": {
        const sorted: DiceValue[] = [...diceValues].sort((a, b) => a - b);
        return (JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5]) ||
                JSON.stringify(sorted) === JSON.stringify([2, 3, 4, 5, 6])) ? 40 : 0;
      }
      case "Yacht": return countValues.some(c => c === 5) ? 50 : 0;
      case "chance": return total;
      default: return 0;
    }
  };

  const selectCategory = (categoryKey: CategoryKey, categoryNum: number): void => {
    if (usedCategories[categoryKey] !== undefined) return;
    if (notStart) return;

    catDisplay[categoryNum] = "yeahCat"
    setCatDisplay([...catDisplay])
    const score: number = getScore(categoryKey, dice);
    setTotalScore(prev => prev + score);
    setUsedCategories(prev => ({ ...prev, [categoryKey]: score }));
    setRerollCount(3);
    setDice([1, 2, 3, 4, 5].map(() => generateRandomDice()));
    setDiceLocked([false, false, false, false, false]);
    setDiceDisplay(["notLock", "notLock", "notLock", "notLock", "notLock" ]);
  };

  const getDiceSymbol = (value: DiceValue): string => {
    const symbols: string[] = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    return symbols[value - 1];
  };

  const resetGame = (): void => {
    window.location.reload();
  };

  const isGameOver: boolean = Object.keys(usedCategories).length === categories.length;

  return (
    <div>
      <div className="main">
        <h1 className="title">
          🎲 Yacht Game 🎲 {message}
        </h1>

        <div className="games">
          {/* 게임 보드 */}
          <div className="board">
            <div className="gamesTop">
              <h2>주사위 </h2>

              <div className="dices">
                {dice.map((die: DiceValue, index: number) => (
                  <div key={index} onClick={() => toggleDiceLock(index)} className={`dice ${diceDisplay[index]}`}>
                    {getDiceSymbol(die)}
                  </div>
                ))}
              </div>
              <p className="chanceNpoint">
                남은 기회: {rerollCount} | 현재 점수: {totalScore}
              </p>

              <p className="text">
                주사위를 클릭하여 고정/해제 <br/>
                R키 또는 버튼으로 다시 굴리기
              </p>
              <button
                onClick={rollDice}
                disabled={rerollCount === 0}
              >
                🎲 주사위 굴리기
              </button>
            </div>
            <div className="gamesBottom">
              <div className="points">
                <h2>점수 결정하기</h2>
                <div className="pointList">
                  {categories.map((category: Category) => {
                    const isUsed: boolean = usedCategories[category.key] !== undefined;
                    const currentScore: number = getScore(category.key, dice);

                    return (
                      <div key={category.key} onClick={() => selectCategory(category.key, category.num)} className={`cat ${catDisplay[category.num]}`}>
                        <div style={{margin: '1vw'}}>
                          <p className="catTitle">{category.name}</p>
                          <p className="catDescript">{category.description}</p>
                        </div>
                        <div style={{margin: '1vw'}}>
                          {isUsed ? (
                            <p className="text-lg font-bold text-blue-600">
                              {usedCategories[category.key]}점
                            </p>
                          ) : (
                            <p className="text-lg font-bold text-green-600">
                              {currentScore}점
                            </p>
                          )}
                        </div>
                      </div>

                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="another">
            {isGameOver && (
              <div className="mt-8 text-center">
                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6">
                  <h2 className="text-3xl font-bold text-yellow-800 mb-2">
                    🎉 게임 종료! 🎉
                  </h2>
                  <p className="text-xl text-yellow-700">
                    최종 점수: {totalScore}점
                  </p>
                  <button
                    onClick={resetGame}
                    className="mt-4 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-all duration-200"
                  >
                    다시 시작
                  </button>
                </div>
              </div>
            )}
            {notStart && (
              <div className="mt-8 text-center">
                <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6">
                  <h2 className="text-3xl font-bold text-yellow-800 mb-2">
                    주사위를 굴려 게임을 시작하세요!
                  </h2>
                </div>
              </div>
            )}
            {message === 1 && (
              <div>
                <h2>
                  🎉 YACHT! 🎉
                </h2>
              </div>
            )}
            {message === 2 && (
              <div>
                <h2>
                  🎉 Four of a Kind! 🎉
                </h2>
              </div>
            )}
            {message === 3 && (
              <div>
                <h2>
                  🎉 Three of a Kind! 🎉
                </h2>
              </div>
            )}
            {message === 4 && (
              <div>
                <h2>
                  🎉 Full House! 🎉
                </h2>
              </div>
            )}
            {message === 5 && (
              <div>
                <h2>
                  🎉 Long Straight! 🎉
                </h2>
              </div>
            )}
            {message === 6 && (
              <div>
                <h2>
                  🎉 Short Straight! 🎉
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YachtGame;