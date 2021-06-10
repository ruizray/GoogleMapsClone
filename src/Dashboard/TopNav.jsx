import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'



class TopNav extends Component {
  state = {
    dropdownToggled: false
  }

  
  render() {
    return (

          <nav className="top-app-bar navbar navbar-expand navbar-dark bg-dark">
            <div className="container-fluid px-4">
              <button
                className="btn btn-lg btn-icon order-1 order-lg-0"
                id="drawerToggle"
                onClick={() => this.props.onNavToggle()}
              >
           
              </button>

              <NavLink to='/analytics' className="navbar-brand me-auto">
                <div className="text-uppercase font-monospace">
                  Material Admin Pro
                  </div>
                </NavLink>
             

              <div className="d-flex align-items-center mx-3 me-lg-0">
                <ul className="navbar-nav d-none d-lg-flex">
                  <li className="nav-item">
                  <NavLink className="nav-link" to='/analytics'>Overview</NavLink>
                  </li>
                  <li className="nav-item">
                  <NavLink className="nav-link" to='/analytics'>Documentation</NavLink>
                  </li>
                </ul>

                <div className="d-flex">
                  <div className="dropdown">
                    <button
                      className={
                        this.props.dropdownToggled === false
                          ? 'btn btn-lg btn-icon dropdown-toggle'
                          : 'btn btn-lg btn-icon dropdown-toggle show'
                      }
                      onClick={()=>this.props.onDropdownToggle()}
                      id="dropdownMenuProfile"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded={this.props.dropdownToggled}
                    >
                      <img
                        style={{ width: '50px' }}
                  
                        alt="User Profile"
                      />
                    </button>

                    {/* <button
                      className="btn btn-lg btn-icon dropdown-toggle"
                      id="dropdownMenuProfile"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="material-icons">person</i>
                    </button> */}

                    <ul
                      className={
                        this.props.dropdownToggled === false
                          ? 'dropdown-menu dropdown-menu-end mt-3'
                          : 'dropdown-menu dropdown-menu-end mt-3 show'
                      }
                      aria-labelledby="dropdownMenuProfile"
                      data-bs-popper="none"
                    >
                      <li>
                        <NavLink className=" dropdown-item" to="/userInfo">
                          <div className="me-3">Profile</div>
                        </NavLink>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#!">
                          <div className="me-3">Settings</div>
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="#!">
                          <div className="me-3">Help</div>
                        </a>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <a
                          onClick={this.signOut}
                          className="dropdown-item"
                          href="#!"
                        >
                          Logout
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </nav>
  

    )
  }
}


export default TopNav

// <nav className="sb-topnav navbar navbar-expand navbar-dark bg-dark">
//   <NavLink
//     style={{ paddingLeft: 0 }}
//     className="nav-link"
//     to="/movies"
//   >
//     {' '}
//     <h1 className="navbar-brand ps-3">React Examples</h1>
//   </NavLink>
//   <button
//     className="btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0"
//     id="sidebarToggle"
//     onClick={() => this.props.onToggle(this.props.nav)}
//   >
//     <FontAwesomeIcon icon={fa.faBars} />
//   </button>

//   <form className="d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
//     <div className="input-group">
//       <input
//         className="form-control"
//         type="text"
//         placeholder="Search for..."
//         aria-label="Search for..."
//         aria-describedby="btnNavbarSearch"
//       ></input>
//       <button
//         className="btn btn-primary"
//         id="btnNavbarSearch"
//         type="button"
//       >
//         <FontAwesomeIcon icon={fa.faSearch} />
//       </button>
//     </div>
//   </form>

//   <ul className="navbar-nav ms-auto ms-md-0 me-3 me-lg-4">
//     <li className="nav-item dropdown">
//       <div
//         className={
//           this.state.dropdownToggled === true
//             ? 'nav-link dropdown-toggle show'
//             : 'nav-link dropdown-toggle'
//         }
//         id="navbarDropdown"
//         onClick={this.handleDropdownToggle}
//         role="button"
//         data-bs-toggle="dropdown"
//         aria-expanded={
//           this.state.dropdownToggled === true ? 'true' : 'false'
//         }
//       >
//         <img
//           style={{ width: '40px' }}
//           src={UserContext.user.photoURL}
//           alt = "User Profile"
//         />
//       </div>
//       <ul
//         className={
//           this.state.dropdownToggled === true
//             ? 'dropdown-menu dropdown-menu-end show'
//             : 'dropdown-menu dropdown-menu-end'
//         }
//         aria-labelledby="navbarDropdown"
//         style={{ right: 0, left: 'auto' }}
//       >
//         <li>
//           <NavLink className=" dropdown-item" to="/userInfo">
//             Profile
//           </NavLink>
//         </li>
//         <li>
//           <a className="dropdown-item" href="#!">
//             Activity Log
//           </a>
//         </li>
//         <li>
//           <hr className="dropdown-divider" />
//         </li>
//         <li>
//           <a
//             onClick={this.signOut}
//             className="dropdown-item"
//             href="#!"
//           >
//             Logout
//           </a>
//         </li>
//       </ul>
//     </li>
//   </ul>
// </nav>
