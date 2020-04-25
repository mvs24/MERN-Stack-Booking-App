import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IconContext } from 'react-icons';
import {
  IoIosStarHalf,
  IoMdStar,
  IoMdStarOutline,
  IoIosStarOutline,
} from 'react-icons/io';
import ErrorModal from '../../shared/components/UI/ErrorModal';
import LoadingSpinner from '../../shared/components/UI/LoadingSpinner';

const ReviewFlightStatistics = (props) => {
  const [reviewStats, setReviewStats] = useState();
  const [totalReviews, setTotalReviews] = useState();
  const [avgRating, setAvgRating] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState();

  useEffect(() => {
    const getReviewStats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `/api/v1/flights/${props.flightId}/review-stats`
        );
        setLoading();
        setReviewStats(res.data.data);
        setTotalReviews(res.data.totalReviews);
        setAvgRating(res.data.avgRating);
      } catch (err) {
        setLoading();
        setError(err.response.data.message);
      }
    };

    getReviewStats();
  }, []);

  if (!avgRating) return null;

  const dec = avgRating.toFixed(2).toString().substring(0, 1);
  const fr = avgRating.toFixed(2).toString().substring(2, 3);
  let nrFr = +fr;

  let halfStar = (
    <IconContext.Provider
      value={{ className: 'tour__info--icon full star blue__review' }}
    >
      <IoIosStarHalf />
    </IconContext.Provider>
  );
  if (nrFr === 0) {
    halfStar = null;
  } else if (nrFr.toFixed(1) > 7) {
    halfStar = (
      <IconContext.Provider
        value={{ className: ' tour__info--icon full star blue__review' }}
      >
        <IoMdStar />
      </IconContext.Provider>
    );
  } else if (nrFr.toFixed(1) < 2.5) {
    halfStar = (
      <IconContext.Provider
        value={{ className: ' tour__info--icon full star blue__review' }}
      >
        <IoMdStarOutline />
      </IconContext.Provider>
    );
  }

  let stars = [];
  for (let i = 0; i < dec; i++) {
    stars.push(
      <IconContext.Provider
        value={{ className: ' tour__info--icon full star blue__review' }}
      >
        <IoMdStar />
      </IconContext.Provider>
    );
  }

  return (
    <div className="review__container blue__reviews">
      {loading && <LoadingSpinner asOverlay />}
      {error && <ErrorModal show onClear={() => setError(false)} />}
      <h2 className="blue__heading">Feedback</h2>
      <div className="review__info">
        <div className="review__info--left">
          <p className="avgRating">RATING: {avgRating}</p>
          {stars.map((star) => star)}
          {halfStar}
          <p className="totalReviews">TOTAL REVIEWS: {totalReviews}</p>
        </div>
        <div className="review__info--right">
          {reviewStats.map((review, i) => {
            let stars = [];
            for (let i = 0; i < review.rating; i++) {
              stars.push(
                <IconContext.Provider
                  value={{
                    className: 'blue__review tour__info--icon full star',
                  }}
                >
                  <IoMdStar />
                </IconContext.Provider>
              );
            }
            for (let i = review.rating; i < 5; i++) {
              stars.push(
                <IconContext.Provider
                  value={{
                    className: 'blue__review tour__info--icon full star',
                  }}
                >
                  <IoIosStarOutline />
                </IconContext.Provider>
              );
            }

            return (
              <div key={i} className="single__review ">
                <div
                  className="bck"
                  style={{
                    background: `linear-gradient(to right, #777 0% ${review.percentage}%, #f4f2f2  ${review.percentage}% 100%)`,
                  }}
                >
                  &nbsp;
                </div>
                {stars}
                <span className="review__span">
                  {review.percentage.toFixed(2)}%
                </span>
                <span className="review__span">
                  ({review.nReviews}{' '}
                  {review.nReviews !== 1 ? (
                    <span>reviews</span>
                  ) : (
                    <span>review</span>
                  )}
                  )
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewFlightStatistics;