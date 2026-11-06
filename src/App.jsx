import React, { useState, useEffect } from 'react';
import { ref, onValue, set, remove } from 'firebase/database';
import { db } from './firebase';
import './App.css';

const AREA_CODES = [
  { code: '1', name: '서울' },
  { code: '6', name: '부산' },
  { code: '4', name: '대구' },
  { code: '2', name: '인천' },
  { code: '5', name: '광주' },
  { code: '3', name: '대전' },
  { code: '7', name: '울산' },
  { code: '31', name: '경기' },
  { code: '32', name: '강원' },
  { code: '39', name: '제주' }
];

const TOUR_API_KEY = "ccb365c1b74b195ab9e40e0e1b33f1e3cfecc4a493866b744863644ce55c023d";

export default function App() {
  const [selectedArea, setSelectedArea] = useState('1');
  const [places, setPlaces] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [loading, setLoading] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    const favoritesRef = ref(db, 'favorites');
    const unsubscribe = onValue(favoritesRef, (snapshot) => {
      const data = snapshot.val();
      setFavorites(data || {});
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchPlaces(selectedArea);
  }, [selectedArea]);

  const fetchPlaces = async (areaCode) => {
    setLoading(true);
    try {
      const url = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${"ccb365c1b74b195ab9e40e0e1b33f1e3cfecc4a493866b744863644ce55c023d"}&numOfRows=16&pageNo=1&MobileOS=ETC&MobileApp=TravelApp&_type=json&areaCode=${areaCode}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const items = data.response?.body?.items?.item || [];
      setPlaces(items);
    } catch (error) {
      console.error("TourAPI 데이터 호출 실패:", error);
      alert("관광지 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (item) => {
    const itemRef = ref(db, `favorites/${item.contentid}`);
    if (favorites[item.contentid]) {
      remove(itemRef);
    } else {
      set(itemRef, {
        contentid: item.contentid,
        title: item.title,
        firstimage: item.firstimage || item.firstimage2 || '',
        addr1: item.addr1 || '',
        savedAt: Date.now()
      });
    }
  };

  const favoriteList = Object.values(favorites);
  const displayItems = showFavoritesOnly ? favoriteList : places;

  return (
    <div className="container">
      <header className="header">
        <h1>✈️ 가고 싶은 여행지 보관함</h1>
        <div className="nav-buttons">
          <button 
            className={`btn ${!showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(false)}
          >
            지역별 관광지 탐색
          </button>
          <button 
            className={`btn ${showFavoritesOnly ? 'active' : ''}`}
            onClick={() => setShowFavoritesOnly(true)}
          >
            💖 내 보관함 ({favoriteList.length})
          </button>
        </div>
      </header>

      {!showFavoritesOnly && (
        <section className="area-selector">
          {AREA_CODES.map((area) => (
            <button
              key={area.code}
              className={`area-chip ${selectedArea === area.code ? 'selected' : ''}`}
              onClick={() => setSelectedArea(area.code)}
            >
              {area.name}
            </button>
          ))}
        </section>
      )}

      {loading ? (
        <div className="loading">관광지 정보를 불러오는 중...</div>
      ) : (
        <main className="grid-container">
          {displayItems.length === 0 ? (
            <div className="empty">표시할 관광지가 없습니다.</div>
          ) : (
            displayItems.map((item) => {
              const isFav = !!favorites[item.contentid];
              const imageSrc = item.firstimage || item.firstimage2 || 'https://via.placeholder.com/300x200?text=No+Image';

              return (
                <div key={item.contentid} className="card">
                  <div className="image-wrapper">
                    <img src={imageSrc} alt={item.title} loading="lazy" />
                    <button 
                      className={`fav-button ${isFav ? 'active' : ''}`}
                      onClick={() => toggleFavorite(item)}
                      aria-label="찜하기"
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div className="card-content">
                    <h3>{item.title}</h3>
                    <p>{item.addr1 || '주소 정보 없음'}</p>
                  </div>
                </div>
              );
            })
          )}
        </main>
      )}
    </div>
  );
}