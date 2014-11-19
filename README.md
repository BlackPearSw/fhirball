![fhirball](./res/branding/fhirball@2x-76@2x.png)

fhirball
========
An Express router for persisting [HL7 FHIR](http://www.hl7.org/implement/standards/fhir/) resources in MongoDB. 
Provides a RESTful API that partially implements the FHIR DSTU 1 proposal.
Routes available are defined using a Conformance resource. 

Installation
------------
To install fhirball:

    npm install fhirball

Test
----
To execute unit tests:

    npm install
    mocha --recursive ./test/spec

To execute integration tests, performing CRUD operations on each sample resource:

    mocha --recursive ./test/e2e

Integration tests assume a mongod instance running on localhost.

Copyright
---------
Copyright 2014 Black Pear Software Ltd.

This material contains content from HL7. Unless otherwise noted in the filename, sample FHIR resources in 
test/e2e/data are © HL7.org 2011+ and used under license (http://www.hl7.org/implement/standards/fhir/license.html)

License
-------
fhirball is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

fhirball is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Acknowledgements
----------------
Supported by [Black Pear Software](www.blackpear.com)
 
Additional contributions from [freshEHR](http://freshehr.com/)

![HL7 FHIR](./res/branding/fhir-logo-www.png)
![Powered by MongoDB](./res/branding/mongodb-powered-by-badge-white.jpg)

