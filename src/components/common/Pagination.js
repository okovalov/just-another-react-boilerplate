import React, { Component } from 'react'
import PropTypes from 'prop-types'

const LEFT_PAGE = 'LEFT'
const RIGHT_PAGE = 'RIGHT'

/**
 * Helper method for creating a range of numbers
 * range(1, 5) => [1, 2, 3, 4, 5]
 */
const range = (from, to, step = 1) => {
  let i = from
  const range = []

  while (i <= to) {
    range.push(i)
    i += step
  }

  return range
}

class PaginateData extends Component {
  constructor(props) {
    super(props)
    this.setProperties(props)
    this.state = { currentPage: props.currentPage }
  }

  setProperties(props) {
    const { totalRecords = null, pageLimit = 30, pageNeighbours = 0 } = props

    this.pageLimit = typeof pageLimit === 'number' ? pageLimit : 30
    this.totalRecords = typeof totalRecords === 'number' ? totalRecords : 0

    this.pageNeighbours =
      typeof pageNeighbours === 'number'
        ? Math.max(0, Math.min(pageNeighbours, 2))
        : 0

    this.totalPages = Math.ceil(this.totalRecords / this.pageLimit)
  }

  componentDidUpdate(props, prevState) {
    if (this.totalRecords !== props.totalRecords) {
      this.setProperties(props)
    }
  }

  gotoPage = page => {
    const { onPageChanged = f => f } = this.props

    const currentPage = Math.max(0, Math.min(page, this.totalPages))

    const paginationData = {
      currentPage,
      totalPages: this.totalPages,
      pageLimit: this.pageLimit,
      totalRecords: this.totalRecords
    }

    this.setState({ currentPage }, () => onPageChanged(paginationData))
  }

  handleClick = page => evt => {
    evt.preventDefault()
    this.gotoPage(page)
  }

  handleMoveLeft = evt => {
    evt.preventDefault()
    let pageToGo = this.state.currentPage - 1
    pageToGo = pageToGo < 1 ? 1 : pageToGo
    this.gotoPage(pageToGo)
  }

  handleMoveRight = evt => {
    evt.preventDefault()
    let pageToGo = this.state.currentPage + 1
    pageToGo = pageToGo > this.totalPages ? this.totalPages : pageToGo
    this.gotoPage(pageToGo)
  }

  fetchPageNumbers = () => {
    const totalPages = this.totalPages
    const currentPage = this.state.currentPage
    const pageNeighbours = this.pageNeighbours

    /**
     * totalNumbers: the total page numbers to show on the control
     * totalBlocks: totalNumbers + 2 to cover for the left(<) and right(>) controls
     */
    const totalNumbers = this.pageNeighbours * 2 + 3
    const totalBlocks = totalNumbers + 2

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - pageNeighbours)
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours)

      let pages = range(startPage, endPage)

      /**
       * hasLeftSpill: has hidden pages to the left
       * hasRightSpill: has hidden pages to the right
       * spillOffset: number of hidden pages either to the left or to the right
       */
      const hasLeftSpill = startPage > 2
      const hasRightSpill = totalPages - endPage > 1
      const spillOffset = totalNumbers - (pages.length + 1)

      switch (true) {
        // handle: (1) < {5 6} [7] {8 9} (10)
        case hasLeftSpill && !hasRightSpill: {
          const fromRange = startPage - spillOffset
          const extraPages = range(fromRange, startPage - 1)
          pages = [LEFT_PAGE, ...extraPages, ...pages]
          break
        }

        // handle: (1) {2 3} [4] {5 6} > (10)
        case !hasLeftSpill && hasRightSpill: {
          const extraPages = range(endPage + 1, endPage + spillOffset)
          pages = [...pages, ...extraPages, RIGHT_PAGE]
          break
        }

        // handle: (1) < {4 5} [6] {7 8} > (10)
        case hasLeftSpill && hasRightSpill:
        default: {
          pages = [LEFT_PAGE, ...pages, RIGHT_PAGE]
          break
        }
      }

      return [1, ...pages, totalPages]
    }

    return range(1, totalPages)
  }

  render() {
    if (!this.totalRecords || this.totalPages === 1) {
      return (
        <nav aria-label="PaginateData">
          <div className={'row'}>
            <div className={'columns page-main-container'}>
              <div className={'page-main-title'}>
                <h2>
                  <strong>{this.props.recordsName}&nbsp;</strong>
                </h2>
              </div>
            </div>
          </div>
        </nav>
      )
    }
    const { currentPage } = this.state
    const pages = this.fetchPageNumbers()

    return (
      <div>
        <nav aria-label="PaginateData">
          <div className={'row'}>
            <div className={'columns page-main-container'}>
              <div className={'page-main-title'}>
                <h2>
                  <strong>{this.props.recordsName}&nbsp;</strong>
                </h2>
              </div>
            </div>
            <div className={'columns text-right'}>
              <div className={'page-main-nav'}>
                <p>
                  <strong>{this.totalRecords}</strong>&nbsp;
                  {this.props.recordsName}&nbsp;Found
                </p>
                <div className={'page-navigation-bar'}>
                  <span className={'page-total-info'}>
                    Page <span>{currentPage}</span> /{' '}
                    <span>{this.totalPages}</span>
                  </span>
                  <ul className="pagination">
                    {pages.map((page, index) => {
                      if (page === LEFT_PAGE)
                        return (
                          <li key={index} className="page-item">
                            <a
                              className="page-link"
                              role="button"
                              aria-label="Previous"
                              onClick={this.handleMoveLeft}>
                              <span aria-hidden="true">&laquo;</span>
                              <span className="sr-only">&nbsp;</span>
                            </a>
                          </li>
                        )

                      if (page === RIGHT_PAGE)
                        return (
                          <li key={index} className="page-item">
                            <a
                              className="page-link"
                              role="button"
                              aria-label="Next"
                              onClick={this.handleMoveRight}>
                              <span aria-hidden="true">&raquo;</span>
                              <span className="sr-only">&nbsp;</span>
                            </a>
                          </li>
                        )

                      return (
                        <li
                          key={index}
                          className={`page-item${
                            currentPage === page ? ' active' : ''
                          }`}>
                          <a
                            className="page-link"
                            role="button"
                            onClick={this.handleClick(page)}>
                            {page}
                          </a>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    )
  }
}

PaginateData.propTypes = {
  totalRecords: PropTypes.number.isRequired,
  pageLimit: PropTypes.number,
  pageNeighbours: PropTypes.number,
  onPageChanged: PropTypes.func
}

export { PaginateData as Pagination }
