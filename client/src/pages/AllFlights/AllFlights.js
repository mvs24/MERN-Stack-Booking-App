import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import LoadingSpinner from '../../shared/components/UI/LoadingSpinner';
import ErrorModal from '../../shared/components/UI/ErrorModal';
import Flight from '../Flights/Flight';
import './AllFlights.css';
import Button from '../../shared/components/Button/Button';
import { IconContext } from 'react-icons';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { IoIosStarHalf, IoMdStar, IoIosStarOutline } from 'react-icons/io';
import Select from 'react-select';

const options = [
  { value: 'mostReviewed', label: 'Most Reviewed' },
  { value: 'highestRated', label: 'Highest Rated' },
  { value: 'lowestPrice', label: 'Lowest Price' },
  { value: 'highestPrice', label: 'Highest Price' },
  { value: 'maxGroupSize', label: 'Maximum Participants' },
  { value: 'mostPopular', label: 'Most popular' },
];

const AllFlights = React.memo((props) => {
  const [flights, setFlights] = useState();
  const [sorted, setSorted] = useState();
  const [notUpdate, setNotUpdate] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const [end, setEnd] = useState(5);
  const [selectedOption, setSelectedOption] = useState({
    value: '',
    label: 'Sort By',
  });
  const [openRatings, setOpenRatings] = useState();
  const [finishedFlights, setFinishedFlights] = useState();
  const [selectedRating, setSelectedRating] = useState();
  const [myFlights, setMyFlights] = useState([]);
  const [endFinished, setEndFinished] = useState(5);

  const start = 0;
  const { isAuthenticated } = props;

  useEffect(() => {
    const getMyFlights = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/bookings/flights/futureBookings');
        setLoading(false);
        const myFlights = res.data.data.map((el) => el._id);
        setMyFlights(myFlights);
      } catch (err) {
        setError(err.response.data.message);
      }
    };

    if (isAuthenticated) {
      getMyFlights();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const getFlights = async () => {
      setLoading(true);
      let res;
      res = await axios.get('/api/v1/flights?sort=-ratingsAverage');
      const finishedRes = await axios.get(
        `/api/v1/flights/finishedFlights?sort=-ratingsAverage`
      );
      setFinishedFlights(finishedRes.data.data);
      setLoading();
      setFlights(res.data.data);
      setEnd(5);
    };

    getFlights();
  }, []);

  const sortBySelection = async (selectedType) => {
    let res;
    if (selectedRating) {
      setLoading(true);
      res = await axios.get(
        `/api/v1/flights?sort=${selectedType}&ratingsAverage[gte]=${selectedRating}`
      );
      setLoading();
      setFlights(res.data.data);
      setSorted((prev) => !prev);
    } else {
      setLoading(true);
      res = await axios.get(`/api/v1/flights?sort=${selectedType}`);
      setLoading();
      setFlights(res.data.data);
      setNotUpdate(true);
      setSorted((prev) => !prev);
    }
  };

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    const selectedValue = selectedOption.value;

    switch (selectedValue) {
      case 'mostReviewed':
        sortBySelection('-ratingsQuantity');
        break;
      case 'highestRated':
        sortBySelection('-ratingsAverage');
        break;
      case 'lowestPrice':
        sortBySelection('pricePerPerson');
        break;
      case 'highestPrice':
        sortBySelection('-pricePerPerson');
        break;
      case 'mostPopular':
        sortBySelection('-numBought');
        break;
      case 'maxGroupSize':
        sortBySelection('-maxGroupSize');
        break;
      default:
        sortBySelection('-ratingsAverage');
    }
  };

  const showMoreHandler = () => {
    setEnd((prev) => prev + 5);
  };

  const openRatingsHandler = () => {
    setOpenRatings((prevState) => !prevState);
  };

  if (loading) return <LoadingSpinner asOverlay />;
  if (!flights) return <LoadingSpinner asOverlay />;
  if (flights && flights.length === 0)
    return (
      <div style={{ margin: '0 auto', textAlign: 'center' }}>
        <h1 className="noFlightHeading">No flights found at this moment...</h1>
        <Button type="blue" clicked={() => props.history.goBack()}>
          Go Back
        </Button>
      </div>
    );

  let firstStars = [];
  for (let i = 0; i < 5; i++) {
    if (i < 4) {
      firstStars.push(
        <IconContext.Provider
          value={{ className: 'blue__review tour__info--icon full star' }}
        >
          <IoMdStar />
        </IconContext.Provider>
      );
    } else {
      firstStars.push(
        <IconContext.Provider
          value={{ className: 'blue__review tour__info--icon full star' }}
        >
          <IoIosStarHalf />
        </IconContext.Provider>
      );
    }
  }

  let secondStars = [];
  for (let i = 0; i < 5; i++) {
    if (i < 4) {
      secondStars.push(
        <IconContext.Provider
          value={{ className: 'blue__review tour__info--icon full star' }}
        >
          <IoMdStar />
        </IconContext.Provider>
      );
    } else {
      secondStars.push(
        <IconContext.Provider
          value={{ className: 'blue__review tour__info--icon full star' }}
        >
          <IoIosStarOutline />
        </IconContext.Provider>
      );
    }
  }

  let thirdStars = [];
  for (let i = 0; i < 5; i++) {
    if (i < 3) {
      thirdStars.push(
        <IconContext.Provider
          value={{ className: 'blue__review tour__info--icon full star' }}
        >
          <IoMdStar />
        </IconContext.Provider>
      );
    } else if (i === 3) {
      thirdStars.push(
        <IconContext.Provider
          value={{ className: 'blue__review tour__info--icon full star' }}
        >
          <IoIosStarHalf />
        </IconContext.Provider>
      );
    } else {
      thirdStars.push(
        <IconContext.Provider
          value={{ className: 'blue__review tour__info--icon full star' }}
        >
          <IoIosStarOutline />
        </IconContext.Provider>
      );
    }
  }

  let zeroStars = [];
  for (let i = 0; i < 5; i++) {
    zeroStars.push(
      <IconContext.Provider
        value={{ className: 'blue__review tour__info--icon full star' }}
      >
        <IoIosStarOutline />
      </IconContext.Provider>
    );
  }

  if (!finishedFlights) return <LoadingSpinner asOverlay />;
  if (finishedFlights.length === 0)
    return (
      <div className="edit__agency--container">
        No finished Flights found! Keep going!
      </div>
    );

  const radioHandler = async (e) => {
    const rating = +e.target.value;
    setSelectedRating(rating);
    let res;

    let selectedOptionValue = '';

    switch (selectedOption.value) {
      case 'mostReviewed':
        selectedOptionValue = '-ratingsQuantity';
        break;
      case 'highestRated':
        selectedOptionValue = '-ratingsAverage';
        break;
      case 'lowestPrice':
        selectedOptionValue = 'pricePerPerson';
        break;
      case 'highestPrice':
        selectedOptionValue = '-pricePerPerson';
        break;
      case 'mostPopular':
        selectedOptionValue = '-numBought';
        break;
      case 'maxGroupSize':
        selectedOptionValue = '-maxGroupSize';
        break;
      default:
        selectedOptionValue = '-ratingsAverage';
    }

    setLoading(true);
    if (selectedOption) {
      res = await axios.get(
        `/api/v1/flights?sort=${selectedOptionValue}&ratingsAverage[gte]=${rating}`
      );
      setFlights(res.data.data);
      setSorted((prev) => !prev);
    } else {
      res = await axios.get(`/api/v1/flights?ratingsAverage[gte]=${rating}`);
      setFlights(res.data.data);
      setSorted((prev) => !prev);
    }
    setLoading();
  };

  const showMoreFinishedHandler = () => {
    setEndFinished((prev) => prev + 5);
  };

  const allFlights = flights.slice(start, end);

  return (
    <div className="all__flights__container">
      <h1 className="all__flights__heading">
        All Future Flights ({flights.length})
      </h1>
      <div className="all__flights__filter">
        <div onClick={openRatingsHandler} className=" allFlights__filter">
          <div className="filter__flex">
            <p className="second">Filter by Ratings</p>
            <IconContext.Provider
              value={{ className: 'blue__review tour__info--icon' }}
            >
              {!openRatings ? <FaArrowDown /> : <FaArrowUp />}
            </IconContext.Provider>
          </div>
        </div>
        {openRatings && (
          <div className="">
            <div className="input__flex">
              <input
                name="radioGroup"
                onChange={radioHandler}
                type="radio"
                value="4.5"
                checked={selectedRating === 4.5}
              />
              <label>{firstStars.map((el) => el)} 4.5 & up</label>
            </div>
            <div className="input__flex">
              {' '}
              <input
                name="radioGroup"
                onChange={radioHandler}
                type="radio"
                value="4"
                checked={selectedRating === 4}
              />
              <label>{secondStars.map((el) => el)} 4 & up</label>
            </div>
            <div className="input__flex">
              {' '}
              <input
                name="radioGroup"
                onChange={radioHandler}
                type="radio"
                value="3.5"
                checked={selectedRating === 3.5}
              />
              <label>{thirdStars.map((el) => el)} 3.5 & up</label>
            </div>
            <div className="input__flex">
              {' '}
              <input
                name="radioGroup"
                onChange={radioHandler}
                type="radio"
                value="0"
                checked={selectedRating === 0}
              />
              <label>{thirdStars.map((el) => el)} 0.0 & up</label>
            </div>
          </div>
        )}
        <Select
          value={selectedOption}
          onChange={handleChange}
          options={options}
          className="select__flights"
        />
      </div>

      <div className="all__flights__item">
        {error && (
          <ErrorModal show onClear={() => setError()}>
            {error ? error : 'Something went wrong'}
          </ErrorModal>
        )}
        {allFlights.map((flight) => (
          <Flight
            notUpdate={notUpdate}
            sorted={sorted}
            booked={myFlights.includes(flight._id)}
            flight={flight}
          />
        ))}
      </div>
      <div className="allFlights__btn__container">
        <Button
          disabled={flights.length <= end}
          className="showMore__button"
          type="pink"
          clicked={showMoreHandler}
        >
          Show More
        </Button>
      </div>

      <div className="finishedTours">
        {finishedFlights ? (
          <div>
            <h1 className="finished__heading">
              FINISHED FLIGHTS: ({finishedFlights.length})
            </h1>
            <div>
              {finishedFlights.slice(start, endFinished).map((flight) => {
                return <Flight finished key={flight._id} flight={flight} />;
              })}

              <div className="allFlights__btn__container">
                <Button
                  disabled={finishedFlights.length <= endFinished}
                  className="showMore__button"
                  type="pink"
                  clicked={showMoreFinishedHandler}
                >
                  Show More Finished Flights
                </Button>
              </div>
            </div>{' '}
          </div>
        ) : null}
      </div>
    </div>
  );
});

const mapStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated,
});

export default connect(mapStateToProps)(AllFlights);
