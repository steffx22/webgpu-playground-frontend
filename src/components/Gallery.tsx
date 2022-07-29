import { useEffect, useState, useRef } from 'react';
import { ImageWrapper } from './ImageWrapper';
import { endpoint, reason, userKey, userName } from '../App'
import './Gallery.css';
import { ScrollMenu } from 'react-horizontal-scrolling-menu';
import { Button } from 'react-bootstrap';
import { defaultSearchTag } from './TopNavigationBar';
import { useLocation } from 'react-router-dom';

interface ICreation {
  creationName: string,
  uid: string,
  url: string,
  displayName: string,

  reportMessages: string[],
}

export function fetchCreations(tag: string) {
  if(tag !== defaultSearchTag) {
    return fetch(endpoint + `filemanagement/getAllCreations/?tag=${tag}`,
    {
      method: 'Get',
    });
  }
  return fetch(endpoint + 'filemanagement/getAllCreations/',
    {
      method: 'Get',
    });
}

export function fetchSubmissions(){
  return fetch(endpoint + 'filemanagement/getAllSubmissions/',
  {
    method: 'Get',
  });
}

export function fetchUserSubmissions() {
  const username = localStorage.getItem(userName);
  return fetch(endpoint + 'filemanagement/getAllSubmissions/?tag=' + username,
  {
    method: 'Get',
  });
}

/* Gets all the creations of the user */
function fetchGivenUserCreations(uid: string) {
  return fetch(endpoint + `filemanagement/getAllUserCreations/?uid=${uid}`,
  {
    method: 'Get',
  })
}

function fetchUserCreations() {
  var uid = localStorage.getItem(userKey);
  if (uid === null) {
    uid = "0"
  }
  return fetchGivenUserCreations(uid)
}

function fetchReportedCreations() {
  return fetch(endpoint + `filemanagement/getReported/`,
  {
    method: 'Get',
  })
}

interface IProps {
  gallery: {
    isAccount: boolean,
    isAllSubmissions: boolean,
    isAllExamples: boolean,
    isReportedCreations: boolean,
  }
}

export const Gallery = ({ gallery }: IProps) => {
  const [rendersList, setRendersList] = useState<{ list: ICreation[] }>(
    {
      list: []
    });
  const [rendersListSubmissions, setRendersListSubmissions] = useState<{ list: ICreation[] }>(
    {
      list: []
    });
  const [rendersListExamples, setRendersListExamples] = useState<{ list: ICreation[] }>(
    {
      list: []
    });

  const [allDisplayed, setAllDisplayed] = useState(false);
  const [allDisplayedSubmissions, setAllDisplayedSubmissions] = useState(false);
  const [allDisplayedExamples, setAllDisplayedExamples] = useState(false);

  const [noCreations, setNoCreations] = useState(false);
  const [noSubmissions, setNoSubmissions] = useState(false);
  const [noExamples, setNoExamples] = useState(false);

  const [error, setError] = useState(false);

  const [creations, setCreations] = useState<{ list: ICreation[] }>({
    list: []
  });
  const [submissions, setSubmissions] = useState<{ list: ICreation[] }>({
    list: []
  });
  const [examples, setExamples] = useState<{ list: ICreation[] }>({
    list: []
  });

  const [page, setPage] = useState(1);
  const loader = useRef(null);
  const location = useLocation()

  const appendRenders = (number: number) => {
    const newList = rendersList.list;

    while (creations.list.length !== 0 && number !== 0) {
      newList.push(creations.list.shift()!)
      number--;
    }
    setRendersList({ list: newList });

    if (creations.list.length === 0 && rendersList.list.length !== 0) {
      setAllDisplayed(true);
    }
  }

  const appendRendersSubmissions = (number: number) => {
    const newList = rendersListSubmissions.list;

    while (submissions.list.length !== 0 && number !== 0) {
      newList.push(submissions.list.shift()!)
      number--;
    }
    setRendersListSubmissions({ list: newList });

    if (submissions.list.length === 0 && rendersListSubmissions.list.length !== 0) {
      setAllDisplayedSubmissions(true);
    }
  }

  const appendRendersExamples = (number: number) => {
    const newList = rendersListExamples.list;

    while (examples.list.length !== 0 && number !== 0) {
      newList.push(examples.list.shift()!)
      number--;
    }
    setRendersListExamples({ list: newList });

    if (examples.list.length === 0 && rendersListExamples.list.length !== 0) {
      setAllDisplayedExamples(true);
    }
  }

  useEffect(() => {
    var options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.4,
    };
    
    const observer = new IntersectionObserver(handleObserver, options);
    if (loader.current) {
      observer.observe(loader.current)
    }

    var tag = "";

    if (location.search.startsWith("?tag="))
      tag = location.search.substring("?tag=".length)

    // creations
    let response = null
    if (gallery.isAccount)
      response = fetchUserCreations()
    else if (gallery.isReportedCreations)
      response = fetchReportedCreations()
    else if (!gallery.isAllSubmissions)
      response = fetchCreations(tag)

    if (response !== null) {
      response.then(response => {
        if (response.ok) {
          response.json().then(data => {
            setCreations({ list: data.creations });
          })
        } else {
          setError(true)
          alert("there was a problem when loading gallery")
        }
      }, _ => {
        setError(true)
        alert("there was a problem when loading gallery")
      })
    }
    
    if (gallery.isReportedCreations)
      return

    // Submissions
    response = null
    if (gallery.isAccount)
      response = fetchUserSubmissions()
    else
      response = fetchSubmissions()

    response.then(response => {
      if (response.ok) {
        response.json().then(data => {
          setSubmissions({ list: data.creations });
        })
      } else {
        setError(true)
        alert("there was a problem when loading gallery submissions")
      }
    }, _ => {
      setError(true)
      alert("there was a problem when loading gallery submissions")
    })

    // Examples
    if ((!gallery.isAccount && !gallery.isAllSubmissions) || gallery.isAllExamples) {
      const examplesUid = "PLEmtvn3RWadqdrmMxU5PulclPb2";
      fetchGivenUserCreations(examplesUid).then(response => {
        if (response.ok) {
          response.json().then(data => {
            setExamples({ list: data.creations });
          })
        } else {
          setError(true)
          alert("there was a problem when loading gallery examples")
        }
      }, _ => {
        setError(true)
        alert("there was a problem when loading gallery examples")
      })
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  

  useEffect(() => {
    setNoCreations(creations.list.length === 0)
  }, [creations])
  
  useEffect(() => {
    setNoSubmissions(submissions.list.length === 0)
  }, [submissions])
  
  useEffect(() => {
    setNoExamples(examples.list.length === 0)
  }, [examples])


  useEffect(() => {
    appendRenders(30);
    appendRendersSubmissions(30);
    appendRendersExamples(30);
    // eslint-disable-next-line
  }, [page])

  useEffect(() => {
    appendRenders(80);
    appendRendersSubmissions(80);
    appendRendersExamples(80);
    // eslint-disable-next-line
  }, [creations, submissions, examples])

  const handleObserver = (entities: any) => {
    const target = entities[0];
    if (target.isIntersecting) {
      setPage((page) => page + 1)
    }
  }

  return (
    <>
    {/* Examples */}
    <div style={{margin: "0em", paddingLeft: '5%', paddingRight: '5%', paddingBottom: '1em', display: gallery.isAllSubmissions || gallery.isAccount || gallery.isAllExamples || gallery.isReportedCreations ? "none" : "block"}}>
        <div style={{paddingTop: '1em', paddingBottom: '1em', textAlign: "left", fontSize: '30px', color: "white", display: "grid"}}>
          <div className="navbar-brand" style={{display: "inline-block", position: "absolute", fontSize: "30px"}}>
            Examples
          </div>

          <div style={{textAlign: "right", display: "inline-block"}}>
            <Button variant="outline-light" size="lg" href={"/allexamples"} onClick={() => gallery.isAllExamples = true }>
              See all
            </Button>
          </div>
        </div>

        {
            !allDisplayedExamples && !noExamples &&
            <div className="spinner-border" role="status" ref={loader}> 
            <span className="sr-only" />
          </div>
        }
        {
          noExamples &&
            <div className="navbar-brand" style={{color: "white", textAlign: "left" as "left", fontSize: "20px"}}>
              No examples yet!
            </div>
        }
        {
          allDisplayedExamples && !noExamples &&
            <div style={{border: "1px solid #888", borderRadius: "5px", padding: "1em"}}>
              <ScrollMenu>
                {rendersListExamples.list.map((render, index) => {
                  return (
                    <a href={`/editshader/false/${render.uid}/${render.creationName}`} key={index.toString()}>
                      <ImageWrapper
                        img={{ src: render.creationName, id: index, uid: render.uid, url: render.url, title: render.displayName }}
                      />
                    </a>
                  );
                })}
              </ScrollMenu>
            </div>
        }
      </div>

      {/* Submissions */}
      <div style={{margin: "0em", paddingLeft: '5%', paddingRight: '5%', paddingBottom: '1em', display: gallery.isAllSubmissions || gallery.isAllExamples || gallery.isReportedCreations ? "none" : "block"}}>
        <div style={{paddingTop: '1em', paddingBottom: '1em', textAlign: "left", fontSize: '30px', color: "white", display: "grid"}}>
        { gallery.isAccount
          ?
            <div className="navbar-brand" style={{display: "inline-block", position: "absolute", fontSize: "30px"}}>
              My submissions
            </div>
          :
            <div className="navbar-brand" style={{display: "inline-block", position: "absolute", fontSize: "30px"}}>
              Submissions
            </div>
          }
          <div style={{textAlign: "right", display: "inline-block"}}>
            <Button variant="outline-light" size="lg" href={gallery.isAccount ? "/mysubmissions" : "/allsubmissions"} onClick={() => gallery.isAllSubmissions = true}>
              See all
            </Button>
          </div>
        </div>

        {
            !allDisplayedSubmissions && !noSubmissions &&
            <div className="spinner-border" role="status" ref={loader}> 
            <span className="sr-only" />
          </div>
        }
        {
          noSubmissions &&
            <div className="navbar-brand" style={{color: "white", textAlign: "left" as "left", fontSize: "20px"}}>
              No submissions yet!!
            </div>
        }
        {
          allDisplayedSubmissions && !noSubmissions &&
            <div style={{border: "1px solid #888", borderRadius: "5px", padding: "1em"}}>
              <ScrollMenu>
                {rendersListSubmissions.list.map((render, index) => {
                  return (
                    <a href={`/editshader/true/${render.uid}/${render.creationName}`} key={index.toString()}>
                      <ImageWrapper
                        img={{ src: render.creationName, id: index, uid: render.uid, url: render.url, title: render.displayName }}
                      />
                    </a>
                  );
                })}
              </ScrollMenu>
            </div>
        }
        
      </div>

      <div style={{margin: "0em", paddingLeft: '5%', paddingRight: '5%', paddingBottom: '1em'}}>
      { gallery.isAccount
          ?
            <div className="navbar-brand" style={{paddingTop: '1em', textAlign: "left", fontSize: '30px', color: "white"}}>
              My posts
            </div>
          :
          gallery.isReportedCreations 
          ?
            <div className="navbar-brand" style={{paddingTop: '1em', textAlign: "left", fontSize: '30px', color: "white"}}>
              Reported
            </div>
          :
            <div className="navbar-brand" style={{paddingTop: '1em', textAlign: "left", fontSize: '30px', color: "white"}}>
              All posts
            </div>
        }
      </div>
      {/* Creations */}
      <div className="gallery_wrapper">
        <div id="gallery" className="gallery">
          {
            !error &&
            (gallery.isAllSubmissions ? rendersListSubmissions : (gallery.isAllExamples ? rendersListExamples : rendersList)).list.map((render, index) => {
              return (
                <a href={gallery.isReportedCreations ? `/reportedcreation/${render.creationName.replace('-', '/')}` :
                  `/editshader/false/${render.uid}/${render.creationName}`}
                  onClick={() => {
                    if (gallery.isReportedCreations) 
                      localStorage.setItem(reason, JSON.stringify(render.reportMessages))
                  }} key={index.toString()}>
                  <ImageWrapper
                    img={{ src: render.creationName, id: index, uid: render.uid, url: render.url, title: render.displayName }}
                  />
                </a>);
            })
          }
          {
            ((gallery.isAllSubmissions && !allDisplayedSubmissions && !noSubmissions) ||
            (gallery.isAllExamples && !allDisplayedExamples && !noExamples) ||
            (!gallery.isAllSubmissions && !gallery.isAllExamples && !allDisplayed && !noCreations && !error )) &&
            <div className="spinner-border" role="status" ref={loader}> 
              <span className="sr-only" />
            </div>
          }
          {
            noSubmissions && gallery.isAllSubmissions &&
            <div
              className="navbar-brand"
              style={{paddingLeft: "5%",
                color: "white", textAlign: "left" as "left", fontSize: "20px"}}
            >
              No submissions yet!
            </div>
          }
          {
            noCreations && !gallery.isAllSubmissions && !gallery.isAllExamples &&
            <div
              className="navbar-brand"
              style={{paddingLeft: "5%", color: "white", textAlign: "left" as "left", fontSize: "20px"}}
            >
              No creations yet!
            </div>
          }
          {
            noExamples && gallery.isAllExamples &&
            <div
              className="navbar-brand"
              style={{paddingLeft: "5%", color: "white", textAlign: "left" as "left", fontSize: "20px"}}
            >
              No examples yet!
            </div>
          }
          {
            error &&
            <div style={{ width: "90vw" }}>
              <h2>
                error :(
              </h2>
            </div>
          }
        </div>
      </div>

    </>)
}