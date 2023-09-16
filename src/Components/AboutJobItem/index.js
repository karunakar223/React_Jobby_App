import {Component} from 'react'
import Cookies from 'js-cookie'
import {AiFillStar} from 'react-icons/ai'
import {BiLinkExternal} from 'react-icons/bi'
import {MdLocationOn} from 'react-icons/md'
import Loader from 'react-loader-spinner'
import Header from '../Header'
import SimilarJobs from '../SimilarJobs'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class AboutJobItem extends Component {
  state = {
    apiStatus: apiStatusConstants.initial,
    similarJobsData: [],
    jobDetails: [],
  }

  componentDidMount() {
    this.getJobData()
  }

  getJobData = async props => {
    const {match} = props
    const {params} = match
    const {id} = params
    this.setState({apiStatus: apiStatusConstants.inProgress})

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs/${id}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }

    const responseJobData = await fetch(apiUrl, options)
    if (responseJobData.ok === true) {
      const fetchedJobData = await responseJobData.json()
      const updatedJobData = [fetchedJobData.job_details].map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        companyWebsiteUrl: eachJob.company_website_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        lifeAtCompany: {
          description: eachJob.life_at_company.description,
          imageUrl: eachJob.life_at_company.image_url,
        },
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        skills: eachJob.skills.map(eachSkill => ({
          imageUrl: eachSkill.image_url,
          name: eachSkill.name,
        })),
        title: eachJob.title,
      }))

      const updatedSimilarJobDetails = fetchedJobData.similar_jobs.map(
        eachItem => ({
          companyLogoUrl: eachItem.company_logo_url,
          id: eachItem.id,
          jobDescription: eachItem.job_description,
          employmentType: eachItem.employment_type,
          location: eachItem.location,
          rating: eachItem.rating,
          title: eachItem.title,
        }),
      )

      this.setState({
        apiStatus: apiStatusConstants.success,
        similarJobsData: updatedSimilarJobDetails,
        jobDetails: updatedJobData,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderJobDetailsSuccessView = () => {
    const {jobDetails, similarJobsData} = this.state
    if (jobDetails.length >= 1) {
      const {
        companyLogoUrl,
        companyWebsiteUrl,
        employmentType,
        jobDescription,
        lifeAtCompany,
        location,
        packagePerAnnum,
        rating,
        skills,
        title,
      } = jobDetails[0]

      return (
        <>
          <div className="job-item-container">
            <div className="first-part-container">
              <div className="img-title-container">
                <img
                  src={companyLogoUrl}
                  alt="job details company logo"
                  className="company-logo"
                />
              </div>
              <div className="title-rating-container">
                <h1 className="title-heading">{title}</h1>
                <div className="star-rating-container">
                  <AiFillStar className="start-icon" />
                  <p className="rating-text">{rating}</p>
                </div>
              </div>
            </div>
            <div className="location-package-container">
              <div className="location-job-type-container">
                <div className="location-icon-location-container">
                  <MdLocationOn className="location-icon" />
                  <p className="location">{location}</p>
                </div>
                <div className="employment-type-icon-employment-type-container">
                  <p className="job-type">{employmentType}</p>
                </div>
              </div>
              <div className="package-container">
                <p className="package">{packagePerAnnum}</p>
              </div>
            </div>
          </div>
          <hr className="item-hr-line" />
          <div className="second-part-container">
            <div className="description-visit-container">
              <h1 className="description-job-heading">Description</h1>
              <a className="visit-anchor" href={companyWebsiteUrl}>
                Visit <BiLinkExternal />
              </a>
            </div>
            <p className="description-para">{jobDescription}</p>
          </div>
          <h1>Skills</h1>
          <ul className="ul-job-details-container">
            {skills.map(eachItem => (
              <li className="li-job-details-container" key={eachItem.name}>
                <img
                  src={eachItem.imageUrl}
                  className="skill-img"
                  alt={eachItem.name}
                />
                <p>{eachItem.name}</p>
              </li>
            ))}
          </ul>
          <div className="company-life-img-container">
            <div className="life-heading-para-container">
              <h1>Life At Company</h1>
              <p>{lifeAtCompany.description}</p>
            </div>
            <img src={lifeAtCompany.imageUrl} alt="life at company" />
          </div>
          <h1 className="similar-jobs-heading">Similar Jobs</h1>
          <ul className="similar-jobs-ul-container">
            {similarJobsData.map(eachItem => (
              <SimilarJobs
                key={eachItem.id}
                similarJobData={eachItem}
                employmentType={employmentType}
              />
            ))}
          </ul>
        </>
      )
    }
    return null
  }

  onRetryJobDetailsAgain = () => {
    this.getJobData()
  }

  renderJobFailureView = () => (
    <div className="job-details-failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Oops! Something Went Wrong</h1>
      <p>we cannot seem to find the page you are looking for.</p>
      <div className="btn-container-failure">
        <button
          className="failure-job-details-btn"
          type="button"
          onClick={this.onRetryJobDetailsAgain}
        >
          Retry
        </button>
      </div>
    </div>
  )

  renderJobLoadingView = () => (
    <div className="job-details-loader" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  renderJobDetails = () => {
    const {apiStatus} = this.state

    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderJobDetailsSuccessView()
      case apiStatusConstants.failure:
        return this.renderJobFailureView()
      case apiStatusConstants.inProgress:
        return this.renderJobLoadingView()

      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="job-details-view-container">
          {this.renderJobDetails()}
        </div>
      </>
    )
  }
}

export default AboutJobItem
