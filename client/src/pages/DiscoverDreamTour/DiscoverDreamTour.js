import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Button from '../../shared/components/Button/Button';
import axios from 'axios';
import LoadingSpinner from '../../shared/components/UI/LoadingSpinner';
import { IconContext } from 'react-icons';
import { MdFilterList } from 'react-icons/md';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import {
  IoIosStarHalf,
  IoMdStar,
  IoIosStarOutline,
  IoIosArrowBack,
  IoIosArrowForward,
} from 'react-icons/io';
import Select from 'react-select';
import './DiscoverDreamTour.css';
import TourItem from '../../components/TourItem/TourItem';
import ErrorModal from '../../shared/components/UI/ErrorModal';
import MapTours from './MapTours';
import Modal from '../../shared/components/UI/Modal';

const options = [
  { value: 'mostReviewed', label: 'Most Reviewed' },
  { value: 'highestRated', label: 'Highest Rated' },
  { value: 'duration', label: 'Duration' },
  { value: 'lowestPrice', label: 'Lowest Price' },
  { value: 'highestPrice', label: 'Highest Price' },
  { value: 'maxGroupSize', label: 'Maximum Participants' },
  { value: 'mostPopular', label: 'Most popular' },
];

const distanceOptions = [
  { value: '100', label: '<100 km' },
  { value: '200', label: '<200 km' },
  { value: '500', label: '<500 km' },
  { value: '1000', label: '<1000 km' },
  { value: '2500', label: '<2500 km' },
  { value: '5000', label: '<5000 km' },
  { value: '10000', label: '<10000 km' },
  { value: '20000', label: '<20000 km' },
];

const DiscoverDreamTour = React.memo((props) => {
  const [allTours, setAllTours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [openCategory, setOpenCategory] = useState();
  const [openRatings, setOpenRatings] = useState();
  const [selectedOption, setSelectedOption] = useState({
    value: null,
    label: 'Sort By',
  });
  const [selectedDistanceOption, setSelectedDistanceOption] = useState({
    value: null,
    label: 'Tours within your distance',
  });
  const [checkedIn, setCheckedIn] = useState([]);
  const [radioValue, setRadioValue] = useState();
  const [openToursWithinModal, setOpenToursWithinModal] = useState();
  const [userLocation, setUserLocation] = useState();
  const [disableBtn, setDisableBtn] = useState(true);
  const [cancelBtn, setCancelBtn] = useState(false);
  const [shouldUpdate2, setShouldUpdate2] = useState();

  const [page, setPage] = useState(1);
  const resPerPage = 4;

  const [startPage, setStartPage] = useState(0);
  const [endPage, setEndPage] = useState(4);

  const [myWishlistIds, setMyWishlistIds] = useState();

  const { location, wishlist, isAuthenticated } = props;

  useEffect(() => {
    if (isAuthenticated && props.wishlist) {
      setMyWishlistIds(props.wishlist.data.map((el) => el.tour));
    }
  }, [isAuthenticated, wishlist]);

  useEffect(() => {
    const currentPage = props.location.search.split('=')[1] * 1;

    if (allTours && currentPage > Math.ceil(allTours.length / resPerPage))
      return;

    setPage(currentPage);

    if (allTours) {
      if (currentPage > Math.ceil(endPage - 2)) {
        if (currentPage === endPage) {
          setStartPage(
            (prevStart) => prevStart + Math.ceil((endPage - startPage) / 2)
          );
          setEndPage(
            (prevEnd) => prevEnd + Math.ceil((endPage - startPage) / 2)
          );
        } else {
          setStartPage(
            (prevStart) => prevStart + Math.ceil((endPage - startPage) / 2) - 1
          );
          setEndPage(
            (prevEnd) => prevEnd + Math.ceil((endPage - startPage) / 2) - 1
          );
        }
      } else {
        if (startPage >= 1) {
          if (currentPage === 2) {
            setStartPage((prevStart) => prevStart - 1);
            setEndPage((prevEnd) => prevEnd - 1);
          } else {
            if (currentPage === startPage + 1) {
              setStartPage((prevStart) => prevStart - 2);
              setEndPage((prevEnd) => prevEnd - 2);
            } else {
              setStartPage((prevStart) => prevStart - 1);
              setEndPage((prevEnd) => prevEnd - 1);
            }
          }
        }
      }
    }
  }, [location]);

  const resetPage = () => {
    props.history.replace(`${props.match.url}?page=${1}`);
  };

  const getAllTours = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/tours');
      setAllTours(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  useEffect(() => {
    getAllTours();
  }, []);

  useEffect(() => {
    const page = props.location.search.split('=')[1];
    setStartPage(page * 1 - 1);
    setEndPage(page * 1 + 3);
  }, []);

  const getRating = () => {
    let rating;

    const ratingInputs = Array.from(
      document.querySelectorAll(`input[type='radio']`)
    );
    ratingInputs.forEach((el) => {
      if (el.checked) rating = el.value;
    });

    return rating;
  };

  const getCheckedInputs = () => {
    let checkedInputs = [];
    const checkboxInputs = Array.from(
      document.querySelectorAll(`input[type='checkbox']`)
    );
    checkboxInputs.forEach((el) => {
      if (el.checked) checkedInputs.push(el.value);
    });

    return checkedInputs;
  };

  const getToursSortedBy = async (sortBy) => {
    let checkedInputs = getCheckedInputs();
    let rating = getRating();

    if (checkedInputs.length === 0) {
      checkedInputs = ['easy', 'medium', 'difficult'];
    }

    try {
      let res;
      setLoading(true);

      if (rating) {
        res = await axios.get(
          `/api/v1/tours?sort=${sortBy}&ratingsAverage[gte]=${rating}&difficulty=${checkedInputs}`
        );
      } else {
        res = await axios.get(
          `/api/v1/tours?sort=${sortBy}&difficulty=${checkedInputs}`
        );
      }
      setAllTours(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response.data.message);
    }

    setShouldUpdate2((prev) => !prev);
  };

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    const option = selectedOption.value;

    switch (option) {
      case 'mostReviewed':
        getToursSortedBy('-ratingsQuantity');
        break;
      case 'highestRated':
        getToursSortedBy('-ratingsAverage');
        break;
      case 'lowestPrice':
        getToursSortedBy('price');
        break;
      case 'highestPrice':
        getToursSortedBy('-price');
        break;
      case 'duration':
        getToursSortedBy('-duration');
        break;
      case 'mostPopular':
        getToursSortedBy('-numBought');
        break;
      case 'maxGroupSize':
        getToursSortedBy('-maxGroupSize');
        break;
      default:
        getToursSortedBy('-ratingsAverage');
    }
    resetPage();
  };

  const handleDistanceChange = (selectedDistanceOption) => {
    setSelectedDistanceOption(selectedDistanceOption);
    if (!selectedDistanceOption) setDisableBtn(true);
    else setDisableBtn(false);
  };

  const openCategoryHandler = () => {
    setOpenCategory((prevState) => !prevState);
  };

  const openRatingsHandler = () => {
    setOpenRatings((prevState) => !prevState);
  };

  const checkboxHandler = async (e) => {
    const rating = getRating();
    let checkedInputs = getCheckedInputs();
    let option;
    if (selectedOption) {
      switch (selectedOption.value) {
        case 'mostReviewed':
          option = '-ratingsQuantity';
          break;
        case 'highestRated':
          option = '-ratingsAverage';
          break;
        case 'lowestPrice':
          option = 'price';
          break;
        case 'highestPrice':
          option = '-price';
          break;
        case 'duration':
          option = '-duration';
          break;
        case 'mostPopular':
          option = '-numBought';
          break;
        case 'maxGroupSize':
          option = '-maxGroupSize';
          break;
        default:
          option = '-ratingsAverage';
      }
    } else {
      option = '-ratingsAverage';
    }

    setCheckedIn(checkedInputs);

    if (checkedInputs.length === 0) {
      checkedInputs = ['easy', 'medium', 'difficult'];
    }

    let res;

    try {
      setLoading(true);
      if (!rating)
        res = await axios.get(
          `/api/v1/tours?difficulty=${checkedInputs}&sort=${option}`
        );
      else
        res = await axios.get(
          `/api/v1/tours?difficulty=${checkedInputs}&ratingsAverage[gte]=${rating}&sort=${option}`
        );
      setAllTours(res.data.data);
      resetPage();
      setLoading();
    } catch (err) {
      setError(err.response.data.data.message);
    }
    setShouldUpdate2((prev) => !prev);
  };

  const radioHandler = async (e) => {
    if (e.target.checked) {
      const radioValue = e.target.value;
      setRadioValue(e.target.value);

      let checkedInputs = getCheckedInputs();

      if (checkedInputs.length === 0) {
        checkedInputs = ['easy', 'medium', 'difficult'];
      }

      let option;
      if (selectedOption) {
        switch (selectedOption.value) {
          case 'mostReviewed':
            option = '-ratingsQuantity';
            break;
          case 'highestRated':
            option = '-ratingsAverage';
            break;
          case 'lowestPrice':
            option = 'price';
            break;
          case 'highestPrice':
            option = '-price';
            break;
          case 'duration':
            option = '-duration';
            break;
          case 'mostPopular':
            option = '-numBought';
            break;
          case 'maxGroupSize':
            option = '-maxGroupSize';
            break;
          default:
            option = '-ratingsAverage';
        }
      } else {
        option = '-ratingsAverage';
      }

      try {
        setLoading(true);
        const res = await axios.get(
          `/api/v1/tours?ratingsAverage[gte]=${radioValue}&difficulty=${checkedInputs}&sort=${option}`
        );

        setAllTours(res.data.data);
        setLoading();
        resetPage();
      } catch (err) {
        setError(err.response.data.data.message);
      }
    }

    setShouldUpdate2((prev) => !prev);
  };

  const getToursWithinHandler = (userLocation) => {
    setOpenToursWithinModal(true);
    setUserLocation(userLocation);
  };

  const getToursWithinDistanceHandler = async () => {
    const distance = selectedDistanceOption.value;

    try {
      setLoading(true);
      const res = await axios.get(
        `/api/v1/tours/tours-within/${distance}/center/${userLocation.latitude},${userLocation.longitude}/unit/km`
      );
      setAllTours(res.data.data);
      setUserLocation();
      setOpenToursWithinModal();
      setCancelBtn(true);
      setLoading(false);
      resetPage();
    } catch (err) {
      setError(err.response.data.message);
    }
    setShouldUpdate2((prev) => !prev);
  };

  const modifyBtn = () => {
    setCancelBtn(true);
  };

  if (loading) return <LoadingSpinner asOverlay />;
  if (isAuthenticated && !myWishlistIds) return <LoadingSpinner asOverlay />;
  if (allTours && allTours.length === 0) return <h1>No Tour found!</h1>;

  const goToPrevPage = () => {
    if (props.location.search.split('=')[1] > 1) {
      props.history.replace(
        `${props.match.url}?page=${props.location.search.split('=')[1] * 1 - 1}`
      );
    }
  };

  const goToNextPage = () => {
    const totalPages = Math.round(allTours.length / resPerPage) + 1;

    if (
      props.location.search.split('=')[1] * 1 + 1 >
      Math.ceil(allTours.length / resPerPage)
    )
      return;

    if (props.location.search.split('=')[1] < totalPages) {
      props.history.replace(
        `${props.match.url}?page=${props.location.search.split('=')[1] * 1 + 1}`
      );
    }
  };

  let pageContent = [];
  for (let i = startPage + 1; i <= endPage; i++) {
    if (Math.round(allTours.length / resPerPage) <= 1) {
      pageContent.push(
        <div>
          <Link
            id={`page-${i}`}
            className={` ${
              i > Math.ceil(allTours.length / resPerPage) * 1
                ? 'disabledLink'
                : ''
            } ${
              props.location.search.split('=')[1] == i ? 'active' : ''
            } page__number`}
            to={`${props.match.url}?page=${i}`}
          >
            {i}
          </Link>
        </div>
      );
    } else {
      if (i === startPage + 1) {
        pageContent.push(
          <div className={`span__center`}>
            <span
              style={{ cursor: 'pointer' }}
              onClick={goToPrevPage}
              className="span__center"
            >
              <IconContext.Provider
                value={{ className: 'blue__review tour__info--icon full star' }}
              >
                <IoIosArrowBack />
              </IconContext.Provider>
            </span>
            <Link
              id={`page-${i}`}
              className={`${
                i > Math.ceil(allTours.length / resPerPage) * 1
                  ? 'disabledLink'
                  : ''
              } ${
                props.location.search.split('=')[1] == i ? 'active' : ''
              } page__number`}
              to={`${props.match.url}?page=${i}`}
            >
              {i}
            </Link>
          </div>
        );
      } else if (i === endPage) {
        pageContent.push(
          <div className="span__center">
            <Link
              id={`page-${i}`}
              className={` ${
                i > Math.ceil(allTours.length / resPerPage) * 1
                  ? 'disabledLink'
                  : ''
              } ${
                props.location.search.split('=')[1] == i ? 'active' : ''
              } page__number`}
              to={`${props.match.url}?page=${i}`}
            >
              {i}
            </Link>
            <span
              style={{ cursor: 'pointer' }}
              onClick={goToNextPage}
              className="span__center"
            >
              <IconContext.Provider
                value={{ className: 'blue__review tour__info--icon full star' }}
              >
                <IoIosArrowForward />
              </IconContext.Provider>
            </span>
          </div>
        );
      } else {
        pageContent.push(
          <div>
            <Link
              id={`page-${i}`}
              className={` ${
                i > Math.ceil(allTours.length / resPerPage) * 1
                  ? 'disabledLink'
                  : ''
              } ${
                props.location.search.split('=')[1] == i ? 'active' : ''
              } page__number`}
              to={`${props.match.url}?page=${i}`}
            >
              {i}
            </Link>
          </div>
        );
      }
    }
  }

  let firstStars = [];
  for (let i = 0; i < 5; i++) {
    if (i < 4) {
      firstStars.push(
        <IconContext.Provider
          value={{ className: 'icon__green tour__info--icon full star' }}
        >
          <IoMdStar />
        </IconContext.Provider>
      );
    } else {
      firstStars.push(
        <IconContext.Provider
          value={{ className: 'icon__green tour__info--icon full star' }}
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
          value={{ className: 'icon__green tour__info--icon full star' }}
        >
          <IoMdStar />
        </IconContext.Provider>
      );
    } else {
      secondStars.push(
        <IconContext.Provider
          value={{ className: 'icon__green tour__info--icon full star' }}
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
          value={{ className: 'icon__green tour__info--icon full star' }}
        >
          <IoMdStar />
        </IconContext.Provider>
      );
    } else if (i === 3) {
      thirdStars.push(
        <IconContext.Provider
          value={{ className: 'icon__green tour__info--icon full star' }}
        >
          <IoIosStarHalf />
        </IconContext.Provider>
      );
    } else {
      thirdStars.push(
        <IconContext.Provider
          value={{ className: 'icon__green tour__info--icon full star' }}
        >
          <IoIosStarOutline />
        </IconContext.Provider>
      );
    }
  }

  if (!allTours) return <LoadingSpinner asOverlay />;

  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;

  let updatedAllTours = allTours.slice(start, end);

  return (
    <>
      <div className="discoverDreamTour__container">
        {loading && <LoadingSpinner asOverlay />}
        {error && (
          <ErrorModal show onClear={() => setError(false)}>
            {error ? error : 'Something went wrong'}
          </ErrorModal>
        )}
        {openToursWithinModal && (
          <Modal
            onCancel={() => setOpenToursWithinModal()}
            show
            header={`Get Tours Within a distance`}
          >
            <div className="distance__container">
              <Select
                value={selectedDistanceOption}
                onChange={handleDistanceChange}
                options={distanceOptions}
                className="selectTickets"
              />
              <Button
                className="discover__button discover__button--confirm"
                disabled={disableBtn}
                clicked={getToursWithinDistanceHandler}
                type="success"
              >
                Confirm the distance
              </Button>
            </div>
          </Modal>
        )}
        <h1 className="discover__h1">Total Future Tours: {allTours.length}</h1>

        <div className="discover__header">
          <li className="filter">
            <IconContext.Provider
              value={{ className: 'icon__green tour__info--icon' }}
            >
              <MdFilterList />
            </IconContext.Provider>
            <p className="second">Filter</p>
          </li>

          <li className="select">
            <Select
              value={selectedOption}
              onChange={handleChange}
              options={options}
            />
          </li>
        </div>
        <div className="filter__tours__container">
          <div className="filters__container">
            <li className="filter__item--category">
              <div onClick={openCategoryHandler} className="filter__item--flex">
                <p className="second">Difficulty</p>
                <IconContext.Provider
                  value={{ className: 'icon__green tour__info--icon' }}
                >
                  {!openCategory ? <FaArrowDown /> : <FaArrowUp />}
                </IconContext.Provider>
              </div>
              {openCategory && (
                <div className="category__hidden">
                  <div>
                    <input
                      checked={checkedIn.includes('easy')}
                      onChange={checkboxHandler}
                      type="checkbox"
                      value="easy"
                    />
                    <label>Easy</label>
                  </div>
                  <div>
                    <input
                      onChange={checkboxHandler}
                      type="checkbox"
                      value="medium"
                      checked={checkedIn.includes('medium')}
                    />
                    <label>Medium</label>
                  </div>
                  <div>
                    <input
                      onChange={checkboxHandler}
                      type="checkbox"
                      value="difficult"
                      checked={checkedIn.includes('difficult')}
                    />
                    <label>Difficult</label>
                  </div>
                </div>
              )}
            </li>

            <li className="filter__item--category">
              <div onClick={openRatingsHandler} className="filter__item--flex">
                <p className="second">Ratings</p>
                <IconContext.Provider
                  value={{ className: 'icon__green tour__info--icon' }}
                >
                  {!openRatings ? <FaArrowDown /> : <FaArrowUp />}
                </IconContext.Provider>
              </div>
              {openRatings && (
                <div className="ratings__hidden">
                  <div className="rhd">
                    <input
                      name="radioGroup"
                      onChange={radioHandler}
                      type="radio"
                      value="4.5"
                      checked={radioValue && +radioValue === 4.5 ? true : false}
                    />
                    <label>{firstStars.map((el) => el)} 4.5 & up</label>
                  </div>
                  <div className="rhd">
                    <input
                      name="radioGroup"
                      onChange={radioHandler}
                      type="radio"
                      value="4"
                      checked={radioValue && +radioValue === 4 ? true : false}
                    />
                    <label>{secondStars.map((el) => el)} 4 & up</label>
                  </div>
                  <div className="rhd">
                    <input
                      name="radioGroup"
                      onChange={radioHandler}
                      type="radio"
                      value="3.5"
                      checked={radioValue && +radioValue === 3.5 ? true : false}
                    />
                    <label>{thirdStars.map((el) => el)} 3.5 & up</label>
                  </div>
                </div>
              )}
            </li>
          </div>
          <div className="all__tours__container">
            <div className="tours__grid">
              {updatedAllTours.length === 0 && (
                <h1 className="updated__tours__heading">
                  No tours found on this page. Go Back!
                </h1>
              )}
              {updatedAllTours.map((tour) => (
                <TourItem
                  pageChanged={page}
                  isTourLiked={
                    isAuthenticated && myWishlistIds.includes(tour._id)
                  }
                  shouldUpdate2={shouldUpdate2}
                  tour={tour}
                />
              ))}
            </div>
            <div className="pageContent">{pageContent.map((el) => el)}</div>
          </div>
        </div>
      </div>

      <MapTours
        totalToursLength={allTours.length}
        modifyBtn={modifyBtn}
        cancelBtn={cancelBtn}
        getToursWithinHandler={getToursWithinHandler}
        tours={allTours}
      />
    </>
  );
});

const mapStateToProps = (state) => {
  return {
    wishlist: state.user.wishlist,
    isAuthenticated: state.user.isAuthenticated,
  };
};

export default connect(mapStateToProps)(DiscoverDreamTour);
